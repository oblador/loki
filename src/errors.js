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

util.inherits(TimeoutError, Error);

module.exports = {
  ReferenceImageError,
  TimeoutError,
};
