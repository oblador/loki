/* eslint-disable global-require, import/no-dynamic-require */
const path = require('path');

function getProjectPackagePath() {
  return path.resolve('./package.json');
}

function getProjectPackage() {
  return require(getProjectPackagePath());
}

function hasReactNativeDependency(pkg) {
  return !!(pkg.dependencies && pkg.dependencies['react-native']);
}

function hasVueDependency(pkg) {
  return !!pkg.dependencies.vue;
}

function isReactNativeProject() {
  return hasReactNativeDependency(getProjectPackage());
}

function isVueProject() {
  return hasVueDependency(getProjectPackage());
}

module.exports = {
  getProjectPackagePath,
  getProjectPackage,
  hasReactNativeDependency,
  hasVueDependency,
  isReactNativeProject,
  isVueProject,
};
