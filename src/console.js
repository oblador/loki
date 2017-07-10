/* eslint-disable no-console */

const chalk = require('chalk');

const info = message => console.log(chalk.dim(message));
const warn = message => console.warn(chalk.yellow(message));
const error = message => console.error(chalk.bold.red(message));
const bold = message => console.log(chalk.bold(message));
const die = message => {
  error(message);
  process.exit(1);
};

module.exports = { info, warn, error, bold, die };
