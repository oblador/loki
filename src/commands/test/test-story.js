const fs = require('fs-extra');
const path = require('path');
const { getImageDiffer } = require('../../diffing');

const getBaseName = (configurationName, kind, story) =>
  `${configurationName} ${kind} ${story}`.replace(/[^a-zA-Z0-9.-]/g, '_');

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
  await target.captureScreenshotForStory(
    kind,
    story,
    outputPath,
    options,
    configuration
  );
  if (await fs.pathExists(referencePath)) {
    const isEqual = await getImageDiffer(options.diffingEngine)(
      referencePath,
      outputPath,
      diffPath,
      tolerance
    );
    if (!isEqual) {
      throw new Error(
        `Screenshot differs from reference, see ${path.relative(
          path.resolve('./'),
          diffPath
        )}`
      );
    }
  }
}

module.exports = testStory;
