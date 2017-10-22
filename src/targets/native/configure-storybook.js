/* eslint-disable import/no-extraneous-dependencies, import/no-unresolved, global-require */

const addons = require('@storybook/addons').default;
const ReactNative = require('react-native');

const DevSettings = ReactNative.NativeModules.DevSettings;
const ExceptionsManager = require('react-native/Libraries/Core/ExceptionsManager');
const {
  resetLoadingImages,
  awaitImagesLoaded,
} = require('./ready-state-manager');

const MESSAGE_PREFIX = 'loki:';

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

  // Monkey patch `Image`
  Object.defineProperty(ReactNative, 'Image', {
    configurable: true,
    enumerable: true,
    get: () => require('./ready-state-emitting-image'),
  });

  const channel = await getAddonsChannel();
  const platform = ReactNative.Platform.OS;

  const on = (eventName, callback) =>
    channel.on(`${MESSAGE_PREFIX}${eventName}`, params => {
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
    customErrorHandler = null;
    ReactNative.StatusBar.setHidden(originalState.statusBarHidden);
    // eslint-disable-next-line no-console
    console.disableYellowBox = originalState.disableYellowBox;
  };

  const prepare = () => {
    customErrorHandler = async (error, isFatal) => {
      if (isFatal) {
        emit('error', {
          error: await getPrettyError(error),
          isFatal,
        });
        restore();
        setTimeout(() => {
          DevSettings.reload();
        }, 1000);
      }
    };
    DevSettings.setHotLoadingEnabled(false);
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

  channel.on('setCurrentStory', async () => {
    try {
      const count = await awaitImagesLoaded();
      emit('imagesLoaded', { count });
    } catch (error) {
      emit('error', {
        error: {
          message: error.message,
        },
        isFatal: false,
      });
    }
    resetLoadingImages();
  });
}

module.exports = configureStorybook;
