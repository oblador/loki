const util = require('util');

function ReferenceImageError(message, kind, story) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
  this.kind = kind;
  this.story = story;
}

util.inherits(ReferenceImageError, Error);

module.exports = {
  ReferenceImageError,
};
