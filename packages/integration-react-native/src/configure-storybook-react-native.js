/* eslint-disable import/no-extraneous-dependencies, import/no-unresolved, global-require */

const storybook = require('@storybook/react-native');
const addons = require('@storybook/addons').default;
const ReactNative = require('react-native');
const ExceptionsManager = require('react-native/Libraries/Core/ExceptionsManager');
const { decorateStorybook } = require('@loki/integration-core');
const readyStateManager = require('./ready-state-manager');

const { awaitReady, resetPendingPromises } = readyStateManager;
const { DevSettings } = ReactNative.NativeModules;

const MESSAGE_PREFIX = 'loki:';
const hasDevSettings = !!DevSettings && !!DevSettings.reload;

let customErrorHandler;

function injectLokiGlobalErrorHandler() {
  if (!global.ErrorUtils) {
    return;
  }

  function genericErrorHandler(e, isFatal) {
    if (customErrorHandler) {
      customErrorHandler(e, isFatal);
    }
    try {
      ExceptionsManager.handleException(e, isFatal);
    } catch (ee) {
      // eslint-disable-next-line no-console
      console.log('Failed to print error: ', ee.message);
      throw e;
    }
  }

  global.ErrorUtils.setGlobalHandler(genericErrorHandler);
}

async function getPrettyError(error) {
  const message = String(error.message).split('\n')[0];
  if (ReactNative.NativeModules.ExceptionsManager) {
    const parseErrorStack = require('react-native/Libraries/Core/Devtools/parseErrorStack');
    const symbolicateStackTrace = require('react-native/Libraries/Core/Devtools/symbolicateStackTrace');
    const stack = parseErrorStack(error);
    const prettyStack = await symbolicateStackTrace(stack);
    return {
      message,
      stack: prettyStack,
    };
  }
  return {
    message,
  };
}

function getAddonsChannel() {
  return new Promise((resolve, reject) => {
    let tries = 0;
    const attemptChannel = () => {
      tries++;
      try {
        const channel = addons.getChannel();
        resolve(channel);
      } catch (error) {
        if (tries < 10) {
          setTimeout(attemptChannel, 100);
        } else {
          reject(
            new Error(`Failed getting addons channel after ${tries} tries`)
          );
        }
      }
    };
    attemptChannel();
  });
}

async function configureStorybook() {
  injectLokiGlobalErrorHandler();

  // Decorate the storiesOf function to be able to skip stories
  const getStorybook = decorateStorybook(storybook, readyStateManager);

  // Monkey patch `Image`
  Object.defineProperty(ReactNative, 'Image', {
    configurable: true,
    enumerable: true,
    get: () => require('./ready-state-emitting-image'),
  });

  const channel = await getAddonsChannel();
  const platform = ReactNative.Platform.OS;

  const on = (eventName, callback) =>
    channel.on(`${MESSAGE_PREFIX}${eventName}`, (params) => {
      if (params && params.platform === platform) {
        callback(params);
      }
    });

  const emit = (eventName, params = {}) =>
    channel.emit(
      `${MESSAGE_PREFIX}${eventName}`,
      Object.assign({ platform }, params)
    );

  const originalState = {
    statusBarHidden: false, // TODO: get actual value
    disableYellowBox: console.disableYellowBox, // eslint-disable-line no-console
  };

  const restore = () => {
    if ('loki' in global) {
      global.loki.isRunning = true;
    }

    customErrorHandler = null;
    ReactNative.StatusBar.setHidden(originalState.statusBarHidden);
    // eslint-disable-next-line no-console
    console.disableYellowBox = originalState.disableYellowBox;
  };

  const prepare = () => {
    if (!('loki' in global)) {
      global.loki = {};
    }
    global.loki.isRunning = true;

    customErrorHandler = async (error, isFatal) => {
      if (isFatal) {
        emit('error', {
          error: await getPrettyError(error),
          isFatal,
          canHeal: hasDevSettings,
        });
        restore();
        if (hasDevSettings) {
          setTimeout(() => {
            DevSettings.reload();
          }, 1000);
        }
      }
    };
    if (hasDevSettings) {
      DevSettings.setHotLoadingEnabled(false);
    }
    ReactNative.StatusBar.setHidden(true, 'none');
    // eslint-disable-next-line no-console
    console.disableYellowBox = true;
  };

  on('prepare', () => {
    prepare();
    setTimeout(() => emit('didPrepare'), platform === 'android' ? 500 : 0);
  });

  on('restore', () => {
    restore();
    emit('didRestore');
  });

  on('getStories', () => {
    const stories = getStorybook().map((component) => ({
      id: component.id,
      kind: component.kind,
      story: component.story,
      parameters: component.parameters.loki || {},
    }));
    emit('setStories', { stories });
  });

  channel.on('setCurrentStory', async () => {
    try {
      await awaitReady();
      emit('ready');
    } catch (error) {
      emit('error', {
        error: {
          message: error.message,
        },
        isFatal: false,
      });
    }
    resetPendingPromises();
  });
}

module.exports = configureStorybook;
