const path = require('path');
const minimist = require('minimist');
const ciInfo = require('ci-info');
const { dependencyAvailable } = require('@loki/core');
const defaults = require('./default-options');

function parseOptions(args, config) {
  const argv = minimist(args, {
    boolean: [
      'requireReference',
      'chromeEnableAnimations',
      'verboseRenderer',
      'dockerWithSudo',
      'chromeDockerWithoutSeccomp',
    ],
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
    chromeDockerImage: $('chromeDockerImage'),
    chromeEnableAnimations: $('chromeEnableAnimations'),
    chromeFlags: $('chromeFlags').split(' '),
    chromeLoadTimeout: parseInt($('chromeLoadTimeout'), 10),
    chromeRetries: parseInt($('chromeRetries'), 10),
    chromeSelector: $('chromeSelector'),
    chromeTolerance: parseFloat($('chromeTolerance'), 10),
    chromeEmulatedMedia: $('chromeEmulatedMedia'),
    skipStoriesPattern: $('skipStories'),
    storiesFilter: $('storiesFilter'),
    diffingEngine:
      $('diffingEngine') || (dependencyAvailable('gm') ? 'gm' : 'looks-same'),
    looksSame: $('looksSame'),
    gm: $('gm'),
    verboseRenderer: $('verboseRenderer'),
    requireReference: $('requireReference') || ciInfo.isCI,
    updateReference: argv._[0] === 'update',
    targetFilter: argv.targetFilter,
    configurationFilter: argv.configurationFilter || argv._[1],
    dockerWithSudo: $('dockerWithSudo'),
    chromeDockerWithoutSeccomp: $('chromeDockerWithoutSeccomp'),
  };
}

module.exports = parseOptions;
