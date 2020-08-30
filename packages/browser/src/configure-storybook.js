/* global window */
const {
  decorateStorybook,
  createReadyStateManager,
} = require('@loki/integration-core');
const populateLokiHelpers = require('./populate-loki-helpers');

function createConfigurator(storybook) {
  return function configureStorybook() {
    if (typeof window === 'object') {
      const readyStateManager = createReadyStateManager();
      populateLokiHelpers(window, {
        getStorybook: decorateStorybook(storybook),
      });
      populateLokiHelpers(window, readyStateManager);
    }
  };
}

module.exports = createConfigurator;
