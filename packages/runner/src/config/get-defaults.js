/* eslint-disable global-require, import/no-dynamic-require */
const map = require('ramda/src/map');
const { dependencyAvailable } = require('@loki/core');
const { isReactNativeProject } = require('./project-package');

const mapChromeAppToDocker = map(config =>
  Object.assign({}, config, {
    target: config.target.replace('chrome.app', 'chrome.docker'),
  })
);

function getDefaults() {
  if (isReactNativeProject()) {
    return require('./defaults-react-native.json');
  }
  const defaults = require('./defaults-react.json');
  if (dependencyAvailable('docker')) {
    return Object.assign({}, defaults, {
      configurations: mapChromeAppToDocker(defaults.configurations),
    });
  }
  return defaults;
}

module.exports = getDefaults;
