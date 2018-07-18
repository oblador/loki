const path = require('path');
const getopts = require('getopts');
const defaults = require('../test/default-options');

function parseOptions(args, config) {
  const argv = getopts(args);

  const $ = key => argv[key] || config[key] || defaults[key];

  return {
    outputDir: path.resolve($('output')),
    referenceDir: path.resolve($('reference')),
  };
}

module.exports = parseOptions;
