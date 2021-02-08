const debug = require('debug')('loki:chrome');
const {
  disableAnimations,
  disableInputCaret,
  disablePointerEvents,
  getSelectorBoxSize,
  getStories,
  getStorybookError,
  awaitLokiReady,
  awaitSelectorPresent,
  setLokiIsRunning,
  setLokiTestAttribute,
  populateLokiHelpers,
} = require('@loki/browser');
const { createReadyStateManager } = require('@loki/integration-core');

const {
  TimeoutError,
  FetchingURLsError,
  ServerError,
  withTimeout,
  withRetries,
  unwrapError,
  getAbsoluteURL,
} = require('@loki/core');
const presets = require('./presets.json');

const RETRY_LOADING_STORIES_TIMEOUT = 10000;
const LOADING_STORIES_TIMEOUT = 60000;
const CAPTURING_SCREENSHOT_TIMEOUT = 30000;
const CAPTURING_SCREENSHOT_RETRY_BACKOFF = 500;
const REQUEST_STABILIZATION_TIMEOUT = 100;
const RESIZE_DELAY = 500;

const delay = (duration) =>
  new Promise((resolve) => setTimeout(resolve, duration));

function createChromeTarget(
  start,
  stop,
  createNewDebuggerInstance,
  baseUrl,
  prepare
) {
  const resolvedBaseUrl = getAbsoluteURL(baseUrl);

  function getDeviceMetrics(options) {
    return {
      width: options.width,
      height: options.height,
      deviceScaleFactor: options.deviceScaleFactor || 1,
      mobile: options.mobile || false,
    };
  }

  async function launchNewTab(options) {
    const fetchFailIgnore =
      options.fetchFailIgnore && new RegExp(options.fetchFailIgnore, 'i');
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

    const pendingRequestURLMap = {};
    const failedURLs = [];
    let stabilizationTimer = null;
    let requestsFinishedAwaiter;

    const maybeFulfillPromise = () => {
      if (!requestsFinishedAwaiter) {
        return;
      }
      const { reject, resolve } = requestsFinishedAwaiter;

      if (Object.keys(pendingRequestURLMap).length === 0) {
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

    const startObservingRequests = () => {
      const requestEnded = (requestId) => {
        delete pendingRequestURLMap[requestId];
        maybeFulfillPromise();
      };

      const requestFailed = (requestId) => {
        const failedURL = pendingRequestURLMap[requestId];
        if (!fetchFailIgnore || !fetchFailIgnore.test(failedURL)) {
          failedURLs.push(failedURL);
        }
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
    };

    const awaitRequestsFinished = () =>
      new Promise((resolve, reject) => {
        requestsFinishedAwaiter = { resolve, reject };
        maybeFulfillPromise();
      });

    const evaluateOnNewDocument = (scriptSource) => {
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

    const ensureNoErrorPresent = async () => {
      const errorMessage = await executeFunctionWithWindow(getStorybookError);
      if (errorMessage) {
        throw new Error(`Failed to render with error "${errorMessage}"`);
      }
    };

    client.executeFunctionWithWindow = executeFunctionWithWindow;

    client.loadUrl = async (url, selectorToBePresent) => {
      await evaluateOnNewDocument(
        `(${populateLokiHelpers})(window, (${createReadyStateManager})());`
      );
      if (!options.chromeEnableAnimations) {
        debug('Disabling animations');
        await evaluateOnNewDocument(`(${disableAnimations})(window);`);
      }
      await evaluateOnNewDocument(`(${disablePointerEvents})(window);`);
      await evaluateOnNewDocument(`(${disableInputCaret})(window);`);
      await evaluateOnNewDocument(`(${setLokiIsRunning})(window);`);

      debug(`Navigating to ${url}`);
      startObservingRequests();
      await Page.navigate({ url });
      await Page.loadEventFired();

      if (selectorToBePresent) {
        debug(`Awaiting selector "${selectorToBePresent}"`);
        try {
          await executeFunctionWithWindow(
            awaitSelectorPresent,
            selectorToBePresent
          );
          debug(`Selector "${selectorToBePresent}" found!`);
        } catch (error) {
          debug(`Error waiting for selector "${error.message}"!`);
          if (error.message.startsWith('Timeout')) {
            await ensureNoErrorPresent();
          }
          throw error;
        }
      }

      debug('Waiting for ensureNoErrorPresent...');
      await ensureNoErrorPresent();

      debug('Waiting for awaitRequestsFinished...');
      await awaitRequestsFinished();

      debug('Awaiting runtime setup');
      await executeFunctionWithWindow(setLokiTestAttribute);

      debug('Waiting for executeFunctionWithWindow...');
      await executeFunctionWithWindow(awaitLokiReady);
    };

    const getPositionInViewport = async (selector) => {
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

    client.captureScreenshot = withRetries(
      options.chromeRetries,
      CAPTURING_SCREENSHOT_RETRY_BACKOFF
    )(
      withTimeout(
        CAPTURING_SCREENSHOT_TIMEOUT,
        'captureScreenshot'
      )(async (selector = 'body') => {
        debug(`Getting viewport position of "${selector}"`);
        const position = await getPositionInViewport(selector);

        if (position.width === 0 || position.height === 0) {
          throw new Error(
            `Selector "${selector} has zero width or height. Can't capture screenshot.`
          );
        }

        const clip = {
          scale: 1,
          x: Math.floor(position.x),
          y: Math.floor(position.y),
          width: Math.ceil(position.width),
          height: Math.ceil(position.height),
        };

        // Clamp x/y positions to viewport otherwise chrome
        // ignores scale
        if (clip.x < 0) {
          clip.width += clip.x;
          clip.x = 0;
        }

        if (clip.y < 0) {
          clip.height += clip.y;
          clip.y = 0;
        }

        // Clap width/height to fit in viewport
        if (clip.x + clip.width > deviceMetrics.width) {
          clip.width = deviceMetrics.width - clip.x;
        }

        if (
          options.disableAutomaticViewportHeight &&
          clip.y + clip.height > deviceMetrics.height
        ) {
          clip.height = deviceMetrics.height - clip.y;
        }

        const contentEndY = clip.y + clip.height;
        const shouldResizeWindowToFit =
          !options.disableAutomaticViewportHeight &&
          contentEndY > deviceMetrics.height;

        if (shouldResizeWindowToFit) {
          const override = Object.assign({}, deviceMetrics, {
            height: contentEndY,
          });
          debug('Resizing window to fit tall content');
          await Emulation.setDeviceMetricsOverride(override);
          // This number is arbitrary and probably excessive,
          // but there are no other events or values to observe
          // that I could find indicating when chrome is done resizing
          await delay(RESIZE_DELAY);
        }

        debug('Capturing screenshot');
        const screenshot = await Page.captureScreenshot({
          format: 'png',
          clip,
        });
        const buffer = Buffer.from(screenshot.data, 'base64');

        if (shouldResizeWindowToFit) {
          await Emulation.setDeviceMetricsOverride(deviceMetrics);
        }

        return buffer;
      })
    );

    return client;
  }

  const getStoryUrl = (storyId) =>
    `${resolvedBaseUrl}/iframe.html?id=${encodeURIComponent(
      storyId
    )}&viewMode=story`;

  const launchStoriesTab = withTimeout(LOADING_STORIES_TIMEOUT)(
    withRetries(
      5,
      RETRY_LOADING_STORIES_TIMEOUT
    )(async (url) => {
      const tab = await launchNewTab({
        width: 100,
        height: 100,
        chromeEnableAnimations: true,
        clearBrowserCookies: false,
        fetchFailIgnore: '/__webpack_hmr',
      });
      await tab.loadUrl(url);
      return tab;
    })
  );

  async function getStorybook() {
    const url = `${resolvedBaseUrl}/iframe.html`;
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
          `Try starting it with "yarn storybook" or pass the --port or --host arguments if it's not running at ${resolvedBaseUrl}`
        );
      }
      throw error;
    }
  }

  async function captureScreenshotForStory(
    storyId,
    options,
    configuration,
    parameters
  ) {
    let tabOptions = Object.assign(
      {
        media: options.chromeEmulatedMedia,
        fetchFailIgnore: options.fetchFailIgnore,
      },
      configuration
    );
    if (configuration.preset) {
      if (!presets[configuration.preset]) {
        throw new Error(`Invalid preset ${configuration.preset}`);
      }
      tabOptions = Object.assign(tabOptions, presets[configuration.preset]);
    }
    const selector =
      parameters.chromeSelector ||
      configuration.chromeSelector ||
      options.chromeSelector;
    const url = getStoryUrl(storyId);

    const tab = await launchNewTab(tabOptions);
    let screenshot;
    try {
      await withTimeout(options.chromeLoadTimeout)(tab.loadUrl(url, selector));
      screenshot = await tab.captureScreenshot(selector);
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
