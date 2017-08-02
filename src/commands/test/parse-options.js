const path = require('path');
const minimist = require('minimist');
const defaults = require('./default-options');
const { dependencyAvailable } = require('../../dependency-detection');

function parseOptions(args, config) {
  const argv = minimist(args, {
    boolean: ['requireReference', 'chromeEnableAnimations'],
  });

  const $ = key => argv[key] || config[key] || defaults[key];

  return {
    outputDir: path.resolve($('output')),
    referenceDir: path.resolve($('reference')),
    differenceDir: path.resolve($('difference')),
    reactUri:
      $('reactUri') || `http://${$('host')}:${argv.port || $('reactPort')}`,
    reactNativeUri: `ws://${$('host')}:${argv.port || $('reactNativePort')}`,
    chromeConcurrency: parseInt($('chromeConcurrency'), 10),
    chromeEnableAnimations: $('chromeEnableAnimations'),
    chromeFlags: $('chromeFlags').split(' '),
    chromeLoadTimeout: parseInt($('chromeLoadTimeout'), 10),
    chromeSelector: $('chromeSelector'),
    chromeTolerance: parseFloat($('chromeTolerance'), 10),
    skipStoriesPattern: $('skipStories'),
    storiesFilter: $('storiesFilter'),
    diffingEngine:
      $('diffingEngine') || (dependencyAvailable('gm') ? 'gm' : 'looks-same'),
    requireReference: $('requireReference'),
    updateReference: argv._[0] === 'update',
    targetFilter: argv.targetFilter,
    configurationFilter: argv.configurationFilter || argv._[1],
  };
}

module.exports = parseOptions;
