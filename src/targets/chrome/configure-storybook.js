/* global window */

function createConfigurator(storybook) {
  return function configureStorybook() {
    if (typeof window === 'object') {
      window.loki = { getStorybook: storybook.getStorybook };
    }
  };
}

module.exports = createConfigurator;
