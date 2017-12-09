/* global window */
const decorateStorybook = require('../decorate-storybook');
const readyStateManager = require('../ready-state-manager');

function createConfigurator(storybook) {
  return function configureStorybook() {
    if (typeof window === 'object') {
      if (!window.loki) {
        window.loki = {};
      }
      window.loki.getStorybook = decorateStorybook(storybook);
      window.loki.registerPendingPromise =
        readyStateManager.registerPendingPromise;
      window.loki.resetPendingPromises = readyStateManager.resetPendingPromises;
      window.loki.awaitReady = readyStateManager.awaitReady;
    }
  };
}

module.exports = createConfigurator;
