/* eslint-disable no-console */

const color = require('turbocolor');

const info = message => console.log(color.dim(message));
const warn = message => console.warn(color.yellow(message));
const error = message => console.error(color.bold.red(message));
const bold = message => console.log(color.bold(message));
const die = (errorOrMessage, instructions) => {
  if (errorOrMessage instanceof Error) {
    error(errorOrMessage.message);
    info(errorOrMessage.stack);
  } else {
    error(errorOrMessage);
    if (instructions) {
      info(instructions);
    }
  }
  process.exit(1);
};

module.exports = { info, warn, error, bold, die };
