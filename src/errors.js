const util = require('util');
const path = require('path');

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

function MissingDependencyError(dependencyName, instructions) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = `${dependencyName} is not installed`;
  this.instructions = instructions;
}

function ServerError(message, instructions) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
  this.instructions = instructions;
}

function formatStackTraceLine({ file, methodName, lineNumber, column }) {
  return `at ${methodName} (${path.relative(
    '.',
    file
  )}:${lineNumber}:${column})`;
}

function NativeError(message, stack) {
  this.name = this.constructor.name;
  this.message = message;
  this.rawStack = stack;
  this.stack = stack && stack.map(formatStackTraceLine).join('\n');
}

util.inherits(ReferenceImageError, Error);
util.inherits(TimeoutError, Error);
util.inherits(MissingDependencyError, Error);
util.inherits(ServerError, Error);
util.inherits(NativeError, Error);

module.exports = {
  ReferenceImageError,
  TimeoutError,
  MissingDependencyError,
  ServerError,
  NativeError,
};
