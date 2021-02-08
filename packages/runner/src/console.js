/* eslint-disable no-console */

const chalk = require('chalk');

const info = (message) => console.log(chalk.dim(message));
const warn = (message) => console.warn(chalk.yellow(message));
const error = (message) => console.error(chalk.bold.red(message));
const bold = (message) => console.log(chalk.bold(message));
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
