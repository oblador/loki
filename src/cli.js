const minimist = require('minimist');
const { die } = require('./console');
const test = require('./commands/test');

function run() {
  const args = process.argv.slice(2);
  const argv = minimist(args);
  const command = argv._[0];

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
