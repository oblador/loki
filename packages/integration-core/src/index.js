const decorateStorybook = require('./decorate-storybook');
const readyStateManager = require('./ready-state-manager');

module.exports = Object.assign(
  {
    decorateStorybook,
  },
  readyStateManager
);
