const fs = require('fs-extra');
const path = require('path');
const getImageDiff = require('../../get-image-diff');
const presets = require('./presets.json');

const getStoryUrl = (baseUrl, kind, story) =>
  `${baseUrl}/iframe.html?selectedKind=${encodeURIComponent(
    kind
  )}&selectedStory=${encodeURIComponent(story)}`;

const getBaseName = (configurationName, kind, story) =>
  `${configurationName} ${kind} ${story}`.replace(/[^a-zA-Z0-9.-]/g, '_');

async function testChromeStory(
  chrome,
  options,
  configurationName,
  kind,
  story
) {
  const configuration = options.configurations[configurationName];
  if (configuration.preset) {
    if (!presets[configuration.preset]) {
      throw new Error(`Invalid preset ${configuration.preset}`);
    }
    Object.assign(configuration, presets[configuration.preset]);
  }

  const url = getStoryUrl(options.baseUrl, kind, story);
  const basename = getBaseName(configurationName, kind, story);
  const filename = `${basename}.png`;
  const outputPath = `${options.outputDir}/${filename}`;
  const referencePath = `${options.referenceDir}/${filename}`;
  const diffPath = `${options.outputDir}/${basename}.diff.png`;
  const tab = await chrome.launchNewTab(configuration);
  await tab.loadUrl(url);
  const current = await tab.captureScreenshot(options.selector);
  await tab.close();
  await fs.outputFile(outputPath, current);
  if (await fs.pathExists(referencePath)) {
    const isEqual = await getImageDiff(referencePath, outputPath, diffPath);
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

module.exports = testChromeStory;
