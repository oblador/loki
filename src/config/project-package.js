/* eslint-disable global-require, import/no-dynamic-require */
const path = require('path');

function getProjectPackagePath() {
  return path.resolve('./package.json');
}

function getProjectPackage() {
  return require(getProjectPackagePath());
}

function hasReactNativeDependency(pkg) {
  return !!pkg.dependencies['react-native'];
}

function isReactNativeProject() {
  return hasReactNativeDependency(getProjectPackage());
}

module.exports = {
  getProjectPackagePath,
  getProjectPackage,
  hasReactNativeDependency,
  isReactNativeProject,
};
