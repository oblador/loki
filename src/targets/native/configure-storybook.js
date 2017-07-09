/* eslint-disable import/no-extraneous-dependencies, import/no-unresolved, import/extensions */
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
    const statusBarOriginallyHidden = false; // TODO: get actual value
    channel.on(`${MESSAGE_PREFIX}hideStatusBar`, () => {
      ReactNative.StatusBar.setHidden(true);
      channel.emit(`${MESSAGE_PREFIX}didHideStatusBar`);
    });
    channel.on(`${MESSAGE_PREFIX}restoreStatusBar`, () => {
      ReactNative.StatusBar.setHidden(statusBarOriginallyHidden);
      channel.emit(`${MESSAGE_PREFIX}didRestoreStatusBar`);
    });
    channel.on('setCurrentStory', () => {
      awaitImagesLoaded().finally(count => {
        channel.emit(`${MESSAGE_PREFIX}imagesLoaded`, { count });
      });
      resetLoadingImages();
    });
  }, 1);
}

module.exports = configureStorybook;
