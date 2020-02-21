const { cosmiconfigSync } = require('cosmiconfig');
const { warn } = require('../console');
const getDefaults = require('./get-defaults');
const {
  getProjectPackage,
  isReactNativeProject,
} = require('./project-package');

function getConfig() {
  const explorer = cosmiconfigSync('loki');
  const exploration = explorer.search();
  if (!exploration) {
    warn('No loki configuration found, using defaults');
  }

  const config = exploration ? exploration.config : getDefaults();

  const pkg = getProjectPackage();
  if (pkg.scripts && pkg.scripts.storybook) {
    const matches = pkg.scripts.storybook.match(/(-p|--port) ([0-9]+)/);
    if (matches) {
      const portKey = isReactNativeProject() ? 'reactNativePort' : 'reactPort';
      // eslint-disable-next-line prefer-destructuring
      config[portKey] = matches[2];
    }
  }
  return config;
}

module.exports = getConfig;
