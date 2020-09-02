const fs = require('fs-extra');
const path = require('path');
const { ReferenceImageError } = require('@loki/core');
const { getImageDiffer } = require('./get-image-differ');
const { getOutputPaths } = require('./get-output-paths');

async function compareScreenshot(
  screenshot,
  options,
  tolerance,
  configurationName,
  kind,
  story
) {
  const { outputPath, referencePath, diffPath } = getOutputPaths(
    options,
    configurationName,
    kind,
    story
  );
  const referenceExists = await fs.pathExists(referencePath);
  const shouldUpdateReference =
    options.updateReference || (!options.requireReference && !referenceExists);

  await fs.outputFile(
    shouldUpdateReference ? referencePath : outputPath,
    screenshot
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

module.exports = compareScreenshot;
