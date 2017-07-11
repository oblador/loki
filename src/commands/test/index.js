const pickBy = require('ramda/src/pickBy');
const minimist = require('minimist');
const { warn, error, info } = require('../../console');
const getConfig = require('../../config');
const parseOptions = require('./parse-options');
const runTests = require('./run-tests');
const { ReferenceImageError } = require('../../errors');

const escapeRegExp = str =>
  str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');

const escapeShell = str => `"${str.replace(/(["\t\n\r$`\\])/g, '\\$1')}"`;

const argObjectToString = args =>
  Object.keys(args)
    .map(arg => {
      const flag = arg.length === 1 ? `-${arg}` : `--${arg}`;
      if (typeof args[arg] === 'boolean') {
        return flag;
      }
      return `${flag}=${escapeShell(args[arg])}`;
    })
    .join(' ');

const getUpdateCommand = (errors, argv) => {
  const args = Object.assign(
    {
      'configuration-filter': argv._[1],
    },
    pickBy((value, key) => {
      switch (key) {
        case '_':
        case 'filter-stories':
        case 'skip-stories':
        case 'require-reference': {
          return false;
        }
        default: {
          return true;
        }
      }
    }, argv),
    {
      'filter-stories': `^${errors
        .map(e => `${e.kind} ${e.story}`)
        .map(escapeRegExp)
        .join('|')}$`,
      'update-reference': true,
    }
  );
  return `yarn loki test -- ${argObjectToString(args)}`;
};

async function test(args) {
  const argv = minimist(args);
  const config = getConfig();
  const options = parseOptions(args, config);

  const targetFilter = new RegExp(argv['target-filter']);
  const configurationFilter = new RegExp(
    argv['configuration-filter'] || argv._[1]
  );
  const matchesFilters = ({ target }, name) =>
    targetFilter.test(target) && configurationFilter.test(name);

  const configurations = pickBy(matchesFilters, config.configurations);

  if (Object.keys(configurations).length === 0) {
    warn('No matching configurations');
    process.exit(0);
  }

  try {
    await runTests(configurations, options);
  } catch (err) {
    if (err.name === 'ListrError') {
      const imageErrors = err.errors.filter(
        e => e instanceof ReferenceImageError
      );
      if (imageErrors.length !== 0) {
        error('Visual tests failed');
        info('You can update the reference files with:');
        info(getUpdateCommand(imageErrors, argv));
      } else {
        error('Some visual tests failed to run');
      }
      process.exit(1);
    }
    throw err;
  }
}

module.exports = test;
