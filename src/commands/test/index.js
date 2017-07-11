const pickBy = require('ramda/src/pickBy');
const minimist = require('minimist');
const { warn } = require('../../console');
const getConfig = require('../../config');
const parseOptions = require('./parse-options');
const runTests = require('./run-tests');

function test(args) {
  const argv = minimist(args);
  const config = getConfig();
  const options = parseOptions(args, config);

  const targetFilter = new RegExp(argv['target-filter']);
  const configurationFilter = new RegExp(argv['configuration-filter'] || argv._[1]);
  const matchesFilters = ({ target }, name) =>
    targetFilter.test(target) && configurationFilter.test(name);

  const configurations = pickBy(matchesFilters, config.configurations);

  if (Object.keys(configurations).length === 0) {
    warn('No matching configurations');
    process.exit(0);
  }

  return runTests(configurations, options);
}

module.exports = test;
