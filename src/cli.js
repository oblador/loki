const minimist = require('minimist');
const { die, bold } = require('./console');
const test = require('./commands/test');
const { version } = require('../package.json');

function run() {
  const args = process.argv.slice(2);
  const argv = minimist(args);
  const command = argv._[0];
  bold(`loki v${version}`);

  switch (command) {
    case undefined:
    case 'test': {
      test(args);
      break;
    }
    default: {
      die(`Invalid command ${command}`);
      break;
    }
  }
}

module.exports = run;
