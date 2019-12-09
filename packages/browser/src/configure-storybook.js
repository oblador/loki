/* global window */
const {
  decorateStorybook,
  registerPendingPromise,
  resetPendingPromises,
  awaitReady,
} = require('@loki/integration-core');

function createConfigurator(storybook) {
  return function configureStorybook() {
    if (typeof window === 'object') {
      if (!window.loki) {
        window.loki = {};
      }
      window.loki.getStorybook = decorateStorybook(storybook);
      window.loki.registerPendingPromise = registerPendingPromise;
      window.loki.resetPendingPromises = resetPendingPromises;
      window.loki.awaitReady = awaitReady;
    }
  };
}

module.exports = createConfigurator;
