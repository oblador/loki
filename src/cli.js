/* eslint-disable global-require */

const minimist = require('minimist');
const { die, bold } = require('./console');
const { version } = require('../package.json');

const getExecutorForCommand = command => {
  switch (command) {
    case 'update':
    case 'test': {
      return require('./commands/test');
    }
    case 'init': {
      return require('./commands/init');
    }
    default: {
      return die(`Invalid command ${command}`);
    }
  }
};

async function run() {
  const args = process.argv.slice(2);
  const argv = minimist(args);
  const command = argv._[0] || 'test';
  const executor = getExecutorForCommand(command);

  bold(`loki ${command} v${version}`);
  try {
    await executor(args);
  } catch (err) {
    die(err);
  }
}

module.exports = run;
