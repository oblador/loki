const minimist = require('minimist');
const { die, bold } = require('./console');
const test = require('./commands/test');
const init = require('./commands/init');
const { version } = require('../package.json');

async function run() {
  const args = process.argv.slice(2);
  const argv = minimist(args);
  const command = argv._[0];
  bold(`loki v${version}`);
  try {
    switch (command) {
      case undefined:
      case 'test': {
        await test(args);
        break;
      }
      case 'init': {
        await init(args);
        break;
      }
      default: {
        die(`Invalid command ${command}`);
        break;
      }
    }
  } catch (err) {
    die(err);
  }
}

module.exports = run;
