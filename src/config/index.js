/* eslint-disable global-require, import/no-dynamic-require */

const path = require('path');
const { warn } = require('../console');

function getConfig() {
  const pkg = require(path.resolve('./package.json'));
  if (!pkg.loki) {
    const isReactNativeProject = !!pkg.dependencies['react-native'];
    if (isReactNativeProject) {
      warn(
        'No loki configuration found in package.json, defaulting to iPhone for iOS.'
      );
      return require('./defaults-react-native.json');
    }
    warn(
      'No loki configuration found in package.json, defaulting to 1366x768 laptop and iPhone 7 for chrome.'
    );
    return require('./defaults-react.json');
  }
  return pkg.loki;
}

module.exports = getConfig;
