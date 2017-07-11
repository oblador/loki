const path = require('path');
const minimist = require('minimist');

function parseOptions(args, config) {
  const argv = minimist(args, {
    boolean: ['update-reference', 'require-reference'],
    default: {
      'chrome-concurrency': '4',
      'chrome-flags': '--headless --disable-gpu --hide-scrollbars',
      'chrome-load-timeout': '60000',
      'chrome-selector': '#root > *',
      'chrome-tolerance': '2.3',
      'diffing-engine': 'looks-same',
      host: 'localhost',
      output: './screenshots/current',
      reference: './screenshots/reference',
      'react-port': '6006',
      'react-native-port': '7007',
    },
  });

  const $ = key => argv[key] || config[key];

  return {
    outputDir: path.resolve($('output')),
    referenceDir: path.resolve($('reference')),
    differenceDir: path.resolve($('difference') || `${$('output')}/diff`),
    reactUri: `http://${$('host')}:${argv.port || $('react-port')}`,
    reactNativeUri: `ws://${$('host')}:${argv.port ||
      $('react-native-port')}`,
    chromeConcurrency: parseInt($('chrome-concurrency'), 10),
    chromeFlags: $('chrome-flags').split(' '),
    chromeLoadTimeout: parseInt($('chrome-load-timeout'), 10),
    chromeSelector: $('chrome-selector'),
    chromeTolerance: parseFloat($('chrome-tolerance'), 10),
    skipStoriesPattern: $('skip-stories'),
    filterStoriesPattern: $('filter-stories'),
    diffingEngine: $('diffing-engine'),
    requireReference: argv['require-reference'],
    updateReference: argv['update-reference'],
  };
}

module.exports = parseOptions;
