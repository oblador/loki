/* eslint-disable prefer-rest-params */
const path = require('path');

class LokiError extends Error {
  constructor(message, errorType, originalArgs) {
    super(message);
    this.name = errorType;
    this.originalArgs = Array.from(originalArgs);
  }
}

class ReferenceImageError extends LokiError {
  constructor(message, kind, story) {
    super(message, 'ReferenceImageError', arguments);
    this.kind = kind;
    this.story = story;
  }
}

class TimeoutError extends LokiError {
  constructor(duration, operationName = 'Operation') {
    super(
      `${operationName} timed out after ${duration}ms`,
      'TimeoutError',
      arguments
    );
  }
}

class MissingDependencyError extends LokiError {
  constructor(dependencyName, instructions) {
    super(
      `${dependencyName} is not installed`,
      'MissingDependencyError',
      arguments
    );
    this.instructions = instructions;
  }
}

class ServerError extends LokiError {
  constructor(message, instructions) {
    super(message, 'ServerError', arguments);
    this.instructions = instructions;
  }
}

class FetchingURLsError extends LokiError {
  constructor(failedURLs) {
    const noun = failedURLs.length === 1 ? 'request' : 'requests';
    const message = `${
      failedURLs.length
    } ${noun} failed to load; ${failedURLs.join(', ')}`;
    super(message, 'FetchingURLsError', arguments);
    this.failedURLs = failedURLs;
  }
}

function formatStackTraceLine({ file, methodName, lineNumber, column }) {
  return `at ${methodName} (${path.relative(
    '.',
    file
  )}:${lineNumber}:${column})`;
}

class NativeError extends LokiError {
  constructor(message, stack, isFatal = true) {
    super(message, 'NativeError', arguments);
    this.rawStack = stack;
    this.stack = stack && stack.map(formatStackTraceLine).join('\n');
    this.isFatal = isFatal;
  }
}

class ChromeError extends LokiError {
  constructor(message, instructions) {
    super(message, 'ChromeError', arguments);
    this.instructions = instructions;
  }
}

const serializeError = (error) =>
  JSON.stringify({
    isSerializedError: true,
    type: error instanceof LokiError ? error.name : 'Error',
    args: error instanceof LokiError ? error.originalArgs : [error.message],
  });

const errorTypes = {
  ReferenceImageError,
  TimeoutError,
  MissingDependencyError,
  FetchingURLsError,
  ServerError,
  NativeError,
  ChromeError,
};

const parseError = (jsonString) => {
  if (typeof jsonString !== 'string') {
    return jsonString;
  }
  let jsonObject;
  try {
    jsonObject = JSON.parse(jsonString);
  } catch (_) {
    return new Error(jsonString.replace(/^[a-zA-Z]*Error: /, ''));
  }
  if (!jsonObject.isSerializedError) {
    return jsonString;
  }
  const ErrorClass = errorTypes[jsonObject.type] || Error;
  return new ErrorClass(...jsonObject.args);
};

module.exports = {
  serializeError,
  parseError,
  LokiError,
  ...errorTypes,
};
