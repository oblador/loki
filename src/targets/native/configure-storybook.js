/* eslint-disable import/no-extraneous-dependencies, import/no-unresolved, global-require */

// eslint-disable-next-line no-underscore-dangle
global.__fbDisableExceptionsManager = true;

const addons = require('@storybook/addons').default;
const ReactNative = require('react-native');

const DevSettings = ReactNative.NativeModules.DevSettings;
const ExceptionsManager = require('react-native/Libraries/Core/ExceptionsManager');
const ErrorUtils = require('react-native/Libraries/Core/ErrorUtils');
const {
  resetLoadingImages,
  awaitImagesLoaded,
} = require('./ready-state-manager');

const MESSAGE_PREFIX = 'loki:';

let customErrorHandler;

function genericErrorHandler(e, isFatal) {
  if (customErrorHandler) {
    customErrorHandler(e, isFatal);
  } else {
    try {
      ExceptionsManager.handleException(e, isFatal);
    } catch (ee) {
      // eslint-disable-next-line no-console
      console.log('Failed to print error: ', ee.message);
      throw e;
    }
  }
}

ErrorUtils.setGlobalHandler(genericErrorHandler);

async function getPrettyError(error) {
  if (ReactNative.NativeModules.ExceptionsManager) {
    const parseErrorStack = require('react-native/Libraries/Core/Devtools/parseErrorStack');
    const symbolicateStackTrace = require('react-native/Libraries/Core/Devtools/symbolicateStackTrace');
    const stack = parseErrorStack(error);
    const prettyStack = await symbolicateStackTrace(stack);
    return {
      message: error.message,
      stack: prettyStack,
    };
  }
  return {
    message: error.message,
  };
}

function configureStorybook() {
  // Monkey patch `Image`
  Object.defineProperty(ReactNative, 'Image', {
    configurable: true,
    enumerable: true,
    get: () => require('./ready-state-emitting-image'),
  });

  // Channel only available in next frame
  setTimeout(() => {
    const channel = addons.getChannel();
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

    channel.on('setCurrentStory', () => {
      awaitImagesLoaded().finally(count => {
        emit('imagesLoaded', { count });
      });
      resetLoadingImages();
    });
  }, 1);
}

module.exports = configureStorybook;
