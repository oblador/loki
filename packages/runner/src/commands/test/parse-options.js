const path = require('path');
const minimist = require('minimist');
const ciInfo = require('ci-info');
const defaults = require('./default-options.json');

function parseOptions(args, config) {
  const argv = minimist(args, {
    boolean: [
      'requireReference',
      'chromeEnableAnimations',
      'verboseRenderer',
      'dockerWithSudo',
      'chromeDockerWithoutSeccomp',
      'passWithNoStories',
      'junitRenderer',
    ],
    string: [
      'junitOutputFile',
    ],
  });

  const $ = (key) => argv[key] || config[key] || defaults[key];

  return {
    outputDir: path.resolve($('output')),
    referenceDir: path.resolve($('reference')),
    differenceDir: path.resolve($('difference')),
    fileNameFormatter: config.fileNameFormatter,
    reactUri:
      $('reactUri') || `http://${$('host')}:${argv.port || $('reactPort')}`,
    reactNativeUri: `ws://${$('host')}:${argv.port || $('reactNativePort')}`,
    dockerNet: $('dockerNet'),
    chromeAwsLambdaFunctionName: $('chromeAwsLambdaFunctionName'),
    chromeAwsLambdaRetries: parseInt($('chromeAwsLambdaRetries'), 10),
    chromeAwsLambdaBatchSize: parseInt($('chromeAwsLambdaBatchSize'), 10),
    chromeAwsLambdaBatchConcurrency: parseInt(
      $('chromeAwsLambdaBatchConcurrency'),
      10
    ),
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
    diffingEngine: $('diffingEngine') || 'pixelmatch',
    fetchFailIgnore: $('fetchFailIgnore'),
    'looks-same': $('looks-same'),
    gm: $('gm'),
    pixelmatch: $('pixelmatch'),
    verboseRenderer: $('verboseRenderer'),
    junitRenderer: $('junitRenderer'),
    junitOutputFile: $('junitOutputFile'),
    requireReference: $('requireReference') || ciInfo.isCI,
    updateReference: argv._[0] === 'update',
    targetFilter: $('targetFilter'),
    configurationFilter: $('configurationFilter'),
    dockerWithSudo: $('dockerWithSudo'),
    chromeDockerWithoutSeccomp: $('chromeDockerWithoutSeccomp'),
    chromeDockerUseCopy: $('chromeDockerUseCopy'),
    silent: $('silent'),
    passWithNoStories: $('passWithNoStories'),
    device: $('device'),
  };
}

module.exports = parseOptions;
