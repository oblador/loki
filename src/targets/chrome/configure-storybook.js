/* global window */
/* eslint-disable global-require, import/no-extraneous-dependencies, import/no-unresolved */

function configureStorybook() {
  if (typeof window === 'object') {
    const storybook = require('@storybook/react');
    window.loki = { getStorybook: storybook.getStorybook };
  }
}

module.exports = configureStorybook;
