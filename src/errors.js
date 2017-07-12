const util = require('util');

function ReferenceImageError(message, kind, story) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
  this.kind = kind;
  this.story = story;
}

function TimeoutError(duration, operationName = 'Operation') {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = `${operationName} timed out after ${duration}ms`;
}

function MissingDependencyError(dependencyName, installationInstructions) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = `${dependencyName} is not installed`;
  this.installationInstructions = installationInstructions;
}

util.inherits(ReferenceImageError, Error);
util.inherits(TimeoutError, Error);
util.inherits(MissingDependencyError, Error);

module.exports = {
  ReferenceImageError,
  TimeoutError,
  MissingDependencyError,
};
