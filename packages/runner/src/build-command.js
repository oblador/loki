const { dependencyAvailable } = require('@loki/core');

const escapeShell = (str) => `"${str.replace(/(["\t\n\r$`\\])/g, '\\$1')}"`;

const isTruthy = (args) => (arg) =>
  args[arg] !== false && typeof args[arg] !== 'undefined';

const stringifyArg = (args) => (arg) => {
  const flag = arg.length === 1 ? `-${arg}` : `--${arg}`;
  if (typeof args[arg] === 'boolean') {
    return flag;
  }
  return `${flag}=${escapeShell(String(args[arg]))}`;
};

const argObjectToString = (args) =>
  Object.keys(args).filter(isTruthy(args)).map(stringifyArg(args)).join(' ');

function buildCommand(command, argObject) {
  const args = argObjectToString(argObject);
  if (dependencyAvailable('loki')) {
    return `loki ${command} ${args}`;
  }
  if (dependencyAvailable('yarn')) {
    return `yarn loki ${command} -- ${args}`;
  }
  if (dependencyAvailable('npm')) {
    return `npm run loki ${command} -- ${args}`;
  }
  return `./node_modules/.bin/loki ${command} ${args}`;
}

module.exports = buildCommand;
