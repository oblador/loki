/* global window */

function createConfigurator(storybook) {
  return function configureStorybook() {
    if (typeof window === 'object') {
      if (!window.loki) {
        window.loki = {};
      }
      window.loki.getStorybook = storybook.getStorybook;
    }
  };
}

module.exports = createConfigurator;
