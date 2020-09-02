/* global window */
const {
  decorateStorybook,
  createReadyStateManager,
} = require('@loki/integration-core');
const populateLokiHelpers = require('./populate-loki-helpers');

function createConfigurator(storybook) {
  return function configureStorybook() {
    if (typeof window === 'object') {
      populateLokiHelpers(window, createReadyStateManager());
      const getStorybook = decorateStorybook(storybook, window.loki); // Pass window.loki as most likely a different readyStateManager has already been assigned making the previous statement a no-op
      populateLokiHelpers(window, { getStorybook });
    }
  };
}

module.exports = createConfigurator;
