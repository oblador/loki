const errors = require('./errors');
const failureHandling = require('./failure-handling');
const dependencyDetection = require('./dependency-detection');
const getAbsoluteURL = require('./get-absolute-url');
const { getLocalIPAddress } = require('./get-local-ip-address');
const { createStaticServer } = require('./create-static-server');
const { getStoriesFromIndex } = require('./get-stories-from-index');

module.exports = Object.assign(
  {
    getAbsoluteURL,
    getLocalIPAddress,
    createStaticServer,
    getStoriesFromIndex,
  },
  errors,
  failureHandling,
  dependencyDetection
);
