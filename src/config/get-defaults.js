/* eslint-disable global-require, import/no-dynamic-require */
const path = require('path');
const map = require('ramda/src/map');
const { dependencyAvailable } = require('../dependency-detection');

const mapChromeAppToDocker = map(config =>
  Object.assign({}, config, {
    target: config.target.replace('chrome.app', 'chrome.docker'),
  })
);

function getDefaults() {
  const pkg = require(path.resolve('./package.json'));
  const isReactNativeProject = !!pkg.dependencies['react-native'];
  if (isReactNativeProject) {
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
