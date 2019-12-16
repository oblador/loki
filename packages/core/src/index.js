const errors = require('./errors');
const failureHandling = require('./failure-handling');
const dependencyDetection = require('./dependency-detection');
const getAbsoluteURL = require('./get-absolute-url');

module.exports = Object.assign(
  { getAbsoluteURL },
  errors,
  failureHandling,
  dependencyDetection
);
