/* eslint-disable import/no-dynamic-require */
const path = require('path');
const { warn } = require('../console');
const getDefaults = require('./get-defaults');

const pkg = require(path.resolve('./package.json'));

function getConfig() {
  if (!pkg.loki) {
    warn('No loki configuration found in package.json, using defaults');
    return getDefaults();
  }
  return pkg.loki;
}

module.exports = getConfig;
