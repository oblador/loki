const fs = require('fs-extra');
const debug = require('debug')('loki:chrome');
const {
  disableAnimations,
  getSelectorBoxSize,
  getStories,
  awaitLokiReady,
  addLokiSessionMarker,
} = require('@loki/browser');
const {
  TimeoutError,
  FetchingURLsError,
  ServerError,
  withTimeout,
  withRetries,
  unwrapError,
} = require('@loki/core');
const presets = require('./presets.json');

const LOADING_STORIES_TIMEOUT = 60000;
const CAPTURING_SCREENSHOT_TIMEOUT = 30000;
const REQUEST_STABILIZATION_TIMEOUT = 100;

function createChromeTarget(
  start,
  stop,
  createNewDebuggerInstance,
  baseUrl,
  prepare
) {
  function getDeviceMetrics(options) {
    return {
      width: options.width,
      height: options.height,
      deviceScaleFactor: options.deviceScaleFactor || 1,
      mobile: options.mobile || false,
    };
  }

  async function launchNewTab(options) {
    const client = await createNewDebuggerInstance();
    const deviceMetrics = getDeviceMetrics(options);

    const { Runtime, Page, Emulation, DOM, Network } = client;

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
    if (options.media) {
      await Emulation.setEmulatedMedia({ media: options.media });
    }

    const awaitRequestsFinished = () =>
      new Promise(async (resolve, reject) => {
        const pendingRequestURLMap = {};
        const failedURLs = [];
        let pageLoaded = false;
        let stabilizationTimer = null;

        const maybeFulfillPromise = () => {
          if (pageLoaded && Object.keys(pendingRequestURLMap).length === 0) {
            if (failedURLs.length !== 0) {
              reject(new FetchingURLsError(failedURLs));
            } else {
              // In some cases such as fonts further requests will only happen after the page has been fully rendered
              if (stabilizationTimer) {
                clearTimeout(stabilizationTimer);
              }
              stabilizationTimer = setTimeout(
                resolve,
                REQUEST_STABILIZATION_TIMEOUT
              );
            }
          }
        };

        const requestEnded = requestId => {
          delete pendingRequestURLMap[requestId];
          maybeFulfillPromise();
        };

        const requestFailed = requestId => {
          failedURLs.push(pendingRequestURLMap[requestId]);
          requestEnded(requestId);
        };

        Network.requestWillBeSent(({ requestId, request }) => {
          if (stabilizationTimer) {
            clearTimeout(stabilizationTimer);
          }
          pendingRequestURLMap[requestId] = request.url;
        });

        Network.responseReceived(({ requestId, response }) => {
          if (response.status >= 400) {
            requestFailed(requestId);
          } else {
            requestEnded(requestId);
          }
        });

        Network.loadingFailed(({ requestId }) => {
          requestFailed(requestId);
        });

        await Page.loadEventFired();
        pageLoaded = true;
        maybeFulfillPromise();
      });

    const evaluateOnNewDocument = scriptSource => {
      if (Page.addScriptToEvaluateOnLoad) {
        // For backwards support
        return Page.addScriptToEvaluateOnLoad({ scriptSource });
      }
      return Page.addScriptToEvaluateOnNewDocument({ scriptSource });
    };

    const executeFunctionWithWindow = async (functionToExecute, ...args) => {
      const stringifiedArgs = ['window']
        .concat(args.map(JSON.stringify))
        .join(',');
      const expression = `(() => Promise.resolve((${functionToExecute})(${stringifiedArgs})).then(JSON.stringify))()`;
      const { result } = await Runtime.evaluate({
        expression,
        awaitPromise: true,
      });
      if (result.subtype === 'error') {
        throw new Error(
          result.description.replace(/^Error: /, '').split('\n')[0]
        );
      }
      return result.value && JSON.parse(result.value);
    };

    client.executeFunctionWithWindow = executeFunctionWithWindow;

    client.loadUrl = async url => {
      if (!options.chromeEnableAnimations) {
        debug('Disabling animations');
        await evaluateOnNewDocument(`(${disableAnimations})(window);`);
      }

      debug(`Navigating to ${url}`);
      await Promise.all([Page.navigate({ url }), awaitRequestsFinished()]);

      debug('Awaiting runtime setup');
      await executeFunctionWithWindow(awaitLokiReady);

      await executeFunctionWithWindow(addLokiSessionMarker);
    };

    const getPositionInViewport = async selector => {
      try {
        return await executeFunctionWithWindow(getSelectorBoxSize, selector);
      } catch (error) {
        if (error.message === 'No visible elements found') {
          throw new Error(
            `Unable to get position of selector "${selector}". Review the \`chromeSelector\` option and make sure your story doesn't crash.`
          );
        }
        throw error;
      }
    };

    client.captureScreenshot = withRetries(options.chromeRetries)(
      withTimeout(CAPTURING_SCREENSHOT_TIMEOUT, 'captureScreenshot')(
        async (selector = 'body') => {
          debug(`Getting viewport position of "${selector}"`);
          const position = await getPositionInViewport(selector);

          if (position.width === 0 || position.height === 0) {
            throw new Error(
              `Selector "${selector} has zero width or height. Can't capture screenshot.`
            );
          }

          debug('Capturing screenshot');
          const clip = Object.assign({ scale: 1 }, position);
          let resetDeviceMetrics = false;
          if (
            !options.disableAutomaticViewportHeight &&
            position.y + position.height > deviceMetrics.height
          ) {
            resetDeviceMetrics = true;
            await Emulation.setDeviceMetricsOverride(
              Object.assign({}, deviceMetrics, {
                height: Math.ceil(position.y + position.height),
              })
            );
          }
          const screenshot = await Page.captureScreenshot({
            format: 'png',
            clip,
          });
          if (resetDeviceMetrics) {
            await Emulation.setDeviceMetricsOverride(deviceMetrics);
          }
          const buffer = Buffer.from(screenshot.data, 'base64');

          return buffer;
        }
      )
    );

    return client;
  }

  const getStoryUrl = (kind, story) =>
    `${baseUrl}/iframe.html?selectedKind=${encodeURIComponent(
      kind
    )}&selectedStory=${encodeURIComponent(story)}`;

  const launchStoriesTab = withTimeout(LOADING_STORIES_TIMEOUT)(
    withRetries(2)(async url => {
      const tab = await launchNewTab({
        width: 100,
        height: 100,
        chromeEnableAnimations: true,
        clearBrowserCookies: false,
      });
      await tab.loadUrl(url);
      return tab;
    })
  );

  async function getStorybook() {
    const url = `${baseUrl}/iframe.html`;
    try {
      const tab = await launchStoriesTab(url);
      return tab.executeFunctionWithWindow(getStories);
    } catch (rawError) {
      const error = unwrapError(rawError);
      if (
        error instanceof TimeoutError ||
        (error instanceof FetchingURLsError && error.failedURLs.includes(url))
      ) {
        throw new ServerError(
          'Failed fetching stories because the server is down',
          `Try starting it with "yarn storybook" or pass the --port or --host arguments if it's not running at ${baseUrl}`
        );
      }
      throw error;
    }
  }

  async function captureScreenshotForStory(
    kind,
    story,
    outputPath,
    options,
    configuration
  ) {
    let tabOptions = Object.assign(
      { media: options.chromeEmulatedMedia },
      configuration
    );
    if (configuration.preset) {
      if (!presets[configuration.preset]) {
        throw new Error(`Invalid preset ${configuration.preset}`);
      }
      tabOptions = Object.assign(tabOptions, presets[configuration.preset]);
    }
    const selector = configuration.chromeSelector || options.chromeSelector;
    const url = getStoryUrl(kind, story);

    const tab = await launchNewTab(tabOptions);
    let screenshot;
    try {
      await withTimeout(options.chromeLoadTimeout)(tab.loadUrl(url));
      screenshot = await tab.captureScreenshot(selector);
      await fs.outputFile(outputPath, screenshot);
    } catch (err) {
      if (err instanceof TimeoutError) {
        debug(`Timed out waiting for "${url}" to load`);
      } else {
        throw err;
      }
    } finally {
      await tab.close();
    }

    return screenshot;
  }

  return {
    start,
    stop,
    prepare,
    getStorybook,
    launchNewTab,
    captureScreenshotForStory,
  };
}

module.exports = createChromeTarget;
