const path = require('path');
const minimist = require('minimist');
const defaults = require('../test/default-options');

function parseOptions(args, config) {
  const argv = minimist(args);

  const $ = (key) => argv[key] || config[key] || defaults[key];

  return {
    outputDir: path.resolve($('output')),
    differenceDir: path.resolve($('difference')),
    referenceDir: path.resolve($('reference')),
    diffOnly: $('diffOnly'),
  };
}

module.exports = parseOptions;
