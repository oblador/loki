/* eslint-disable import/no-extraneous-dependencies, import/no-unresolved, global-require */

const addons = require('@storybook/addons').default;
const ReactNative = require('react-native');
const {
  resetLoadingImages,
  awaitImagesLoaded,
} = require('./ready-state-manager');

const MESSAGE_PREFIX = 'loki:';

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

    on('prepare', () => {
      ReactNative.StatusBar.setHidden(true, 'none');
      console.disableYellowBox = true; // eslint-disable-line no-console
      setTimeout(() => emit('didPrepare'), platform === 'android' ? 500 : 0);
    });

    on('restore', () => {
      ReactNative.StatusBar.setHidden(originalState.statusBarHidden);
      console.disableYellowBox = originalState.disableYellowBox; // eslint-disable-line no-console
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
