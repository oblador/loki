#!/usr/bin/env node

const args = process.argv.slice(2);
const argv = require('minimist')(args);
const { die } = require('./console');
const test = require('./commands/test');

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
