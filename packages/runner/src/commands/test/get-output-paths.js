const { slugify } = require('transliteration');

const SLUGIFY_OPTIONS = {
  lowercase: false,
  separator: '_',
  allowedChars: 'a-zA-Z0-9',
};

const defaultFileNameFormatter = ({ configurationName, kind, story }) =>
  slugify(`${configurationName} ${kind} ${story}`, SLUGIFY_OPTIONS);

function getOutputPaths(options, configurationName, kind, story) {
  const getBaseName = options.fileNameFormatter || defaultFileNameFormatter;
  const basename = getBaseName({ configurationName, kind, story });
  const filename = `${basename}.png`;
  const outputPath = `${options.outputDir}/${filename}`;
  const referencePath = `${options.referenceDir}/${filename}`;
  const diffPath = `${options.differenceDir}/${filename}`;

  return { outputPath, referencePath, diffPath };
}

module.exports = { defaultFileNameFormatter, getOutputPaths };
