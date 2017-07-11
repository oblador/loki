const path = require('path');
const minimist = require('minimist');

function parseOptions(args, config) {
  const argv = minimist(args, {
    boolean: ['no-headless-chrome'],
    default: {
      reference: './screenshots/reference',
      output: './screenshots/current',
      'chrome-concurrency': '4',
      'chrome-flags': '--headless --disable-gpu --hide-scrollbars',
      'chrome-tolerance': '2.3',
      'chrome-selector': '#root > *',
      host: 'localhost',
      'react-port': '6006',
      'react-native-port': '7007',
    },
  });

  return {
    outputDir: path.resolve(argv.output),
    referenceDir: path.resolve(argv.reference),
    differenceDir: path.resolve(argv.difference || `${argv.output}/diff`),
    reactUri: `http://${argv.host}:${argv.port || argv['react-port']}`,
    reactNativeUri: `ws://${argv.host}:${argv.port ||
      argv['react-native-port']}`,
    chromeSelector: argv['chrome-selector'] || config['chrome-selector'],
    chromeFlags: argv['chrome-flags'].split(' '),
    chromeConcurrency: parseInt(argv['chrome-concurrency'], 10),
    chromeTolerance: parseFloat(argv['chrome-tolerance'], 10),
    skipStoriesPattern: argv['skip-stories'],
    diffingEngine: argv['diffing-engine'] || 'looks-same',
  };
}

module.exports = parseOptions;
