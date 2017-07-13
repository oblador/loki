const pickBy = require('ramda/src/pickBy');
const uniq = require('ramda/src/uniq');
const minimist = require('minimist');
const { warn, error, info } = require('../../console');
const getConfig = require('../../config');
const parseOptions = require('./parse-options');
const runTests = require('./run-tests');
const { ensureDependencyAvailable } = require('../../dependency-detection');
const { ReferenceImageError } = require('../../errors');

const escapeRegExp = str => str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');

const escapeShell = str => `"${str.replace(/(["\t\n\r$`\\])/g, '\\$1')}"`;

const argObjectToString = args =>
  Object.keys(args)
    .filter(arg => args[arg] !== false && typeof args[arg] !== 'undefined')
    .map(arg => {
      const flag = arg.length === 1 ? `-${arg}` : `--${arg}`;
      if (typeof args[arg] === 'boolean') {
        return flag;
      }
      return `${flag}=${escapeShell(String(args[arg]))}`;
    })
    .join(' ');

const getUpdateCommand = (errors, argv) => {
  const stories = uniq(errors.map(e => `${e.kind} ${e.story}`));
  const storiesFilter = `^${stories.map(escapeRegExp).join('|')}$`;
  const tooManyToFilter = stories.length > 10;

  const args = Object.assign(
    {
      configurationFilter: argv._[1],
      storiesFilter: !tooManyToFilter && storiesFilter,
    },
    pickBy((value, key) => {
      switch (key) {
        case '_':
        case 'requireReference': {
          return false;
        }
        case 'storiesFilter':
        case 'skipStories': {
          return tooManyToFilter;
        }
        default: {
          return true;
        }
      }
    }, argv)
  );
  return `yarn loki update -- ${argObjectToString(args)}`;
};

async function test(args) {
  const argv = minimist(args);
  const config = getConfig();
  const options = parseOptions(args, config);

  if (options.diffingEngine === 'gm') {
    ensureDependencyAvailable('gm');
  }

  const targetFilter = new RegExp(options.targetFilter);
  const configurationFilter = new RegExp(options.configurationFilter);
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
