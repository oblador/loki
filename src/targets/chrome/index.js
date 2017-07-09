const fs = require('fs-extra');
const debug = require('debug')('loki:chrome');
const CDP = require('chrome-remote-interface');
const chromeLauncher = require('lighthouse/chrome-launcher/chrome-launcher');
const fetchStorybook = require('./fetch-storybook');
const presets = require('./presets.json');

function createChromeTarget({
  baseUrl = 'http://localhost:6006',
  chromeFlags = ['--headless', '--disable-gpu', '--hide-scrollbars'],
}) {
  let instance;

  async function start(options = {}) {
    const launchOptions = Object.assign(
      {
        chromeFlags,
        logLevel: 'silent',
      },
      options
    );
    debug(
      `Launching chrome with flags "${launchOptions.chromeFlags.join(' ')}"`
    );
    instance = await chromeLauncher.launch(launchOptions);
  }

  async function stop() {
    if (instance) {
      debug('Killing chrome');
      await instance.kill();
    }
    debug('No chrome instance to kill');
  }

  async function getInstance() {
    if (!instance) {
      await start();
    }
    return instance;
  }

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
    const deviceMetrics = getDeviceMetrics(options);

    debug('Launching new tab');
    const { port } = await getInstance();
    debug(`New tab launched with debugger at port ${port}`);
    const target = await CDP.New({ port });
    const client = await CDP({ port, target });

    const { Runtime, Page, Emulation, DOM, Network } = client;

    await Runtime.enable();
    await Network.enable();
    if (options.userAgent) {
      await Network.setUserAgentOverride({
        userAgent: options.userAgent,
      });
    }
    if (options.clearBrowserCookies) {
      await Network.clearBrowserCookies();
    }
    await DOM.enable();
    await Page.enable();
    await Emulation.setDeviceMetricsOverride(deviceMetrics);

    client.close = () => {
      debug('New closing tab');
      CDP.Close({ port, id: target.id });
    };

    client.loadUrl = async url => {
      debug(`Navigating to ${url}`);
      await Page.navigate({ url });
      debug('Awaiting load event');
      await Page.loadEventFired();
    };

    client.captureScreenshot = async (selector = 'body') => {
      const scale = deviceMetrics.deviceScaleFactor;

      debug(`Setting viewport to "${selector}"`);
      const { root: { nodeId: documentNodeId } } = await DOM.getDocument();
      const { nodeId } = await DOM.querySelector({
        selector,
        nodeId: documentNodeId,
      });
      const { model } = await DOM.getBoxModel({ nodeId });
      const [x, y] = model.border;
      const size = {
        width: model.width * scale,
        height: model.height * scale,
      };

      await Emulation.setVisibleSize(size);
      await Emulation.forceViewport({ x, y, scale });

      debug('Capturing screenshot');
      const screenshot = await Page.captureScreenshot({ format: 'png' });
      const buffer = new Buffer(screenshot.data, 'base64');

      return buffer;
    };

    return client;
  }

  const getStoryUrl = (kind, story) =>
    `${baseUrl}/iframe.html?selectedKind=${encodeURIComponent(
      kind
    )}&selectedStory=${encodeURIComponent(story)}`;

  async function getStorybook() {
    return fetchStorybook(baseUrl);
  }

  async function captureScreenshotForStory(
    kind,
    story,
    outputPath,
    options,
    configurationName
  ) {
    const configuration = options.configurations[configurationName];
    if (configuration.preset) {
      if (!presets[configuration.preset]) {
        throw new Error(`Invalid preset ${configuration.preset}`);
      }
      Object.assign(configuration, presets[configuration.preset]);
    }
    const tab = await launchNewTab(configuration);
    await tab.loadUrl(getStoryUrl(kind, story));
    const screenshot = await tab.captureScreenshot(options.selector);
    await fs.outputFile(outputPath, screenshot);
    await tab.close();
    return screenshot;
  }

  return { start, stop, getStorybook, captureScreenshotForStory };
}

module.exports = createChromeTarget;
