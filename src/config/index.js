const { warn } = require('../console');
const getDefaults = require('./get-defaults');
const {
  getProjectPackage,
  isReactNativeProject,
} = require('./project-package');

function getConfig() {
  const pkg = getProjectPackage();
  if (!pkg.loki) {
    warn('No loki configuration found in package.json, using defaults');
  }
  const config = pkg.loki || getDefaults();
  if (pkg.scripts && pkg.scripts.storybook) {
    const matches = pkg.scripts.storybook.match(/(-p|--port) ([0-9]+)/);
    if (matches) {
      const portKey = isReactNativeProject() ? 'reactNativePort' : 'reactPort';
      config[portKey] = matches[2];
    }
  }
  return config;
}

module.exports = getConfig;
