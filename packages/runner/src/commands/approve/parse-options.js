const path = require('path');
const minimist = require('minimist');
const defaults = require('../test/default-options');

function parseOptions(args, config) {
  const argv = minimist(args);

  const $ = (key) => argv[key] || config[key] || defaults[key];

  return {
    outputDir: path.resolve($('output')),
    referenceDir: path.resolve($('reference')),
  };
}

module.exports = parseOptions;
