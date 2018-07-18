const path = require('path');
const getopts = require('getopts');
const ciInfo = require('ci-info');
const { dependencyAvailable } = require('../../dependency-detection');
const defaults = require('./default-options');
const getAbsoluteURL = require('./get-absolute-url');

function parseOptions(args, config) {
  const argv = getopts(args, {
    boolean: ['requireReference', 'chromeEnableAnimations', 'verboseRenderer'],
  });

  const $ = key => argv[key] || config[key] || defaults[key];

  return {
    outputDir: path.resolve($('output')),
    referenceDir: path.resolve($('reference')),
    differenceDir: path.resolve($('difference')),
    reactUri:
      getAbsoluteURL($('reactUri')) ||
      `http://${$('host')}:${argv.port || $('reactPort')}`,
    reactNativeUri: `ws://${$('host')}:${argv.port || $('reactNativePort')}`,
    chromeConcurrency: parseInt($('chromeConcurrency'), 10),
    chromeDockerImage: $('chromeDockerImage'),
    chromeEnableAnimations: $('chromeEnableAnimations'),
    chromeFlags: $('chromeFlags').split(' '),
    chromeLoadTimeout: parseInt($('chromeLoadTimeout'), 10),
    chromeRetries: parseInt($('chromeRetries'), 10),
    chromeSelector: $('chromeSelector'),
    chromeTolerance: parseFloat($('chromeTolerance'), 10),
    skipStoriesPattern: $('skipStories'),
    storiesFilter: $('storiesFilter'),
    diffingEngine:
      $('diffingEngine') || (dependencyAvailable('gm') ? 'gm' : 'looks-same'),
    verboseRenderer: $('verboseRenderer') || ciInfo.isCI,
    requireReference: $('requireReference') || ciInfo.isCI,
    updateReference: argv._[0] === 'update',
    targetFilter: argv.targetFilter,
    configurationFilter: argv.configurationFilter || argv._[1],
  };
}

module.exports = parseOptions;
