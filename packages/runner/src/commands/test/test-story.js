const fs = require('fs-extra');
const path = require('path');
const { slugify } = require('transliteration');
const { ReferenceImageError } = require('@loki/core');
const { getImageDiffer } = require('./get-image-differ');

const SLUGIFY_OPTIONS = {
  lowercase: false,
  separator: '_',
};

const getBaseName = (configurationName, kind, story) =>
  slugify(`${configurationName} ${kind} ${story}`, SLUGIFY_OPTIONS);

async function testStory(
  target,
  options,
  tolerance,
  configuration,
  configurationName,
  kind,
  story
) {
  const basename = getBaseName(configurationName, kind, story);
  const filename = `${basename}.png`;
  const outputPath = `${options.outputDir}/${filename}`;
  const referencePath = `${options.referenceDir}/${filename}`;
  const diffPath = `${options.differenceDir}/${filename}`;
  const referenceExists = await fs.pathExists(referencePath);
  const shouldUpdateReference =
    options.updateReference || (!options.requireReference && !referenceExists);

  await target.captureScreenshotForStory(
    kind,
    story,
    shouldUpdateReference ? referencePath : outputPath,
    options,
    configuration
  );

  if (shouldUpdateReference) {
    return;
  }

  if (!referenceExists) {
    throw new ReferenceImageError('No reference image found', kind, story);
  }

  const isEqual = await getImageDiffer(
    options.diffingEngine,
    options[options.diffingEngine]
  )(referencePath, outputPath, diffPath, tolerance);

  if (!isEqual) {
    throw new ReferenceImageError(
      `Screenshot differs from reference, see ${path.relative(
        path.resolve('./'),
        diffPath
      )}`,
      kind,
      story
    );
  }
}

module.exports = testStory;
