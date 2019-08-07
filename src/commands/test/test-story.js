const fs = require('fs-extra');
const path = require('path');
const { slugify } = require('transliteration');
const { ReferenceImageError } = require('../../errors');
const { getImageDiffer } = require('../../diffing');

const getBaseName = (
  configurationName,
  kind,
  story,
  outputFilenamesLowercase
) =>
  slugify(`${configurationName} ${kind} ${story}`, {
    lowercase: outputFilenamesLowercase,
    separator: '_',
  });

async function testStory(
  target,
  options,
  tolerance,
  configuration,
  configurationName,
  kind,
  story
) {
  const basename = getBaseName(
    configurationName,
    kind,
    story,
    options.outputFilenamesLowercase
  );
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
