/* global window */
const decorateStorybook = require('../decorate-storybook');

function createConfigurator(storybook) {
  return function configureStorybook() {
    if (typeof window === 'object') {
      if (!window.loki) {
        window.loki = {};
      }
      window.loki.getStorybook = decorateStorybook(storybook);
    }
  };
}

module.exports = createConfigurator;
