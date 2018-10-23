const createChromeAppTarget = require('./app');
const createChromeDockerTarget = require('./docker');
const createChromeDockerExtTarget = require('./dockerExt');

module.exports = {
  createChromeAppTarget,
  createChromeDockerTarget,
  createChromeDockerExtTarget
};
