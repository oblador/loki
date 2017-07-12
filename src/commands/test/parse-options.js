const path = require('path');
const minimist = require('minimist');
const defaults = require('./default-options');

function parseOptions(args, config) {
  const argv = minimist(args, {
    boolean: ['require-reference'],
  });

  const $ = key => argv[key] || config[key] || defaults[key];

  return {
    outputDir: path.resolve($('output')),
    referenceDir: path.resolve($('reference')),
    differenceDir: path.resolve($('difference') || `${$('output')}/diff`),
    reactUri: `http://${$('host')}:${argv.port || $('react-port')}`,
    reactNativeUri: `ws://${$('host')}:${argv.port || $('react-native-port')}`,
    chromeConcurrency: parseInt($('chrome-concurrency'), 10),
    chromeFlags: $('chrome-flags').split(' '),
    chromeLoadTimeout: parseInt($('chrome-load-timeout'), 10),
    chromeSelector: $('chrome-selector'),
    chromeTolerance: parseFloat($('chrome-tolerance'), 10),
    skipStoriesPattern: $('skip-stories'),
    filterStoriesPattern: $('filter-stories'),
    diffingEngine: $('diffing-engine'),
    requireReference: argv['require-reference'],
    updateReference: argv._[0] === 'update',
  };
}

module.exports = parseOptions;
