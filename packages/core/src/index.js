const errors = require('./errors');
const failureHandling = require('./failure-handling');
const dependencyDetection = require('./dependency-detection');

module.exports = Object.assign(
  {},
  errors,
  failureHandling,
  dependencyDetection
);
