/* global window */
const { createReadyStateManager } = require('@loki/integration-core');
const populateLokiHelpers = require('./populate-loki-helpers');

function createConfigurator(storybook) {
  return function configureStorybook() {
    if (typeof window === 'object') {
      populateLokiHelpers(window, createReadyStateManager());
      populateLokiHelpers(window, { getStorybook: () => storybook });
    }
  };
}

module.exports = createConfigurator;
