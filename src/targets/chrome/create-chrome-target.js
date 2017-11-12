const fs = require('fs-extra');
const debug = require('debug')('loki:chrome');
const fetchStorybook = require('./fetch-storybook');
const presets = require('./presets.json');
const { withTimeout, TimeoutError } = require('../../failure-handling');

function createChromeTarget(
  start,
  stop,
  createNewDebuggerInstance,
  baseUrl,
  storybookUrl
) {
  function getDeviceMetrics(options) {
    return {
      width: options.width,
      height: options.height,
      deviceScaleFactor: options.deviceScaleFactor || 1,
      mobile: options.mobile || false,
      fitWindow: options.fitWindow || false,
    };
  }

  async function launchNewTab(options) {
    const client = await createNewDebuggerInstance();
    const deviceMetrics = getDeviceMetrics(options);

    const { Runtime, Page, Emulation, DOM, CSS, Network } = client;

    await Runtime.enable();
    await Network.enable();
    await DOM.enable();
    await Page.enable();
    if (options.userAgent) {
      await Network.setUserAgentOverride({
        userAgent: options.userAgent,
      });
    }
    if (options.clearBrowserCookies) {
      await Network.clearBrowserCookies();
    }
    await Emulation.setDeviceMetricsOverride(deviceMetrics);

    const awaitRequestsFinished = async () => {
      const requestURLMap = {};
      const failedURLs = [];

      const requestFailed = requestId => {
        failedURLs.push(requestURLMap[requestId]);
      };

      Network.requestWillBeSent(({ requestId, request }) => {
        requestURLMap[requestId] = request.url;
      });

      Network.responseReceived(({ requestId, response }) => {
        if (response.status >= 400) {
          requestFailed(requestId);
        }
      });

      Network.loadingFailed(({ requestId }) => {
        requestFailed(requestId);
      });

      await Page.loadEventFired();

      if (failedURLs.length !== 0) {
        const noun = failedURLs.length === 1 ? 'request' : 'requests';
        const errorMessage = `${failedURLs.length} ${noun} failed to load; ${failedURLs.join(
          ', '
        )}`;
        throw new Error(errorMessage);
      }
    };

    client.loadUrl = async url => {
      debug(`Navigating to ${url}`);
      const { frameId } = await Page.navigate({ url });
      debug('Awaiting requests loaded');
      await awaitRequestsFinished();
      if (!options.chromeEnableAnimations) {
        await CSS.enable();
        const { styleSheetId } = await CSS.createStyleSheet({ frameId });
        await CSS.setStyleSheetText({
          styleSheetId,
          text: `* {
            -webkit-transition: none !important;
            transition: none !important;
            -webkit-animation: none !important;
            animation: none !important;
          }`,
        });
      }
    };

    const getPositionInViewport = async selector => {
      const expression = `(() => {
        const element = document.querySelector(${JSON.stringify(selector)});
        if (!element) {
          throw new Error('Unable to find element');
        }
        const { x, y, width, height } = element.getBoundingClientRect();
        return { x, y, width, height };
      })()`;

      const { result } = await Runtime.evaluate({
        expression,
        returnByValue: true,
      });

      if (result.subtype === 'error') {
        throw new Error(
          `Unable to get position of selector "${selector}". Review the \`chromeSelector\` option and make sure your story doesn't crash.`
        );
      }

      return result.value;
    };

    client.captureScreenshot = withTimeout(
      30000,
      'captureScreenshot'
    )(async (selector = 'body') => {
      debug(`Getting viewport position of "${selector}"`);
      const position = await getPositionInViewport(selector);

      debug('Capturing screenshot');
      const clip = Object.assign({ scale: 1 }, position);
      const screenshot = await Page.captureScreenshot({
        format: 'png',
        clip,
      });
      const buffer = new Buffer(screenshot.data, 'base64');

      return buffer;
    });

    return client;
  }

  const getStoryUrl = (kind, story) =>
    `${baseUrl}/iframe.html?selectedKind=${encodeURIComponent(
      kind
    )}&selectedStory=${encodeURIComponent(story)}`;

  async function getStorybook() {
    return fetchStorybook(storybookUrl || baseUrl);
  }

  async function captureScreenshotForStory(
    kind,
    story,
    outputPath,
    options,
    configuration
  ) {
    let tabOptions = configuration;
    if (configuration.preset) {
      if (!presets[configuration.preset]) {
        throw new Error(`Invalid preset ${configuration.preset}`);
      }
      tabOptions = Object.assign(
        {},
        configuration,
        presets[configuration.preset]
      );
    }
    const selector = configuration.chromeSelector || options.chromeSelector;
    const url = getStoryUrl(kind, story);

    const tab = await launchNewTab(tabOptions);
    try {
      await withTimeout(options.chromeLoadTimeout)(tab.loadUrl(url));
    } catch (err) {
      if (err instanceof TimeoutError) {
        debug(`Timed out waiting for "${url}" to load`);
      } else {
        throw err;
      }
    }
    const screenshot = await tab.captureScreenshot(selector);
    await fs.outputFile(outputPath, screenshot);
    await tab.close();
    return screenshot;
  }

  return { start, stop, getStorybook, launchNewTab, captureScreenshotForStory };
}

module.exports = createChromeTarget;
