/* global window */
/* eslint-disable global-require, import/no-extraneous-dependencies, import/no-unresolved */

function configureStorybook() {
  if (typeof window === 'object') {
    const { getStorybook } = require('@storybook/react');
    window.loki = { getStorybook };
  }
}

module.exports = configureStorybook;
