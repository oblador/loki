/* global fetch, AbortSignal */
const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const { setTimeout: delay } = require('timers/promises');
const AWS = require('aws-sdk');
const { PNG } = require('pngjs');
const { createChromeAppTarget } = require('@loki/target-chrome-app');
const {
  createChromeAWSLambdaTarget,
} = require('@loki/target-chrome-aws-lambda');
const { createChromeDockerTarget } = require('@loki/target-chrome-docker');
const compareScreenshot = require('@loki/runner/src/commands/test/compare-screenshot');
const {
  getOutputPaths,
} = require('@loki/runner/src/commands/test/get-output-paths');

const [fixture, targetName, mode] = process.argv.slice(2);
const project = path.join(__dirname, 'generated', fixture);
const results = path.join(
  __dirname,
  'results',
  `${fixture}-${targetName}-${mode}`
);
const ids = [
  'compatibility-button--primary',
  'compatibility-button--secondary',
];
const options = {
  chromeSelector: '#compat-button',
  chromeLoadTimeout: 15000,
  chromeRetries: 0,
};
const configuration = { width: 800, height: 600, deviceScaleFactor: 1 };

async function waitForServer(url) {
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(1000) });
      if (response.ok) return;
    } catch (error) {
      // Storybook is still starting.
    }
    await delay(1000);
  }
  throw new Error(`Storybook did not start at ${url}`);
}

function createLambdaTarget() {
  AWS.config.update({
    endpoint: process.env.LOKI_COMPAT_LAMBDA_URL,
    region: 'us-east-1',
    credentials: { accessKeyId: 'local', secretAccessKey: 'local' },
    maxRetries: 30,
    retryDelayOptions: { customBackoff: () => 1000 },
    httpOptions: { timeout: 90000 },
  });
  return createChromeAWSLambdaTarget({
    baseUrl: 'file:./storybook',
    chromeAwsLambdaFunctionName: 'function',
  });
}

function checkPng(buffer, color = [102, 51, 153, 255]) {
  assert(Buffer.isBuffer(buffer), 'Missing screenshot');
  const png = PNG.sync.read(buffer);
  assert.deepEqual([png.width, png.height], [80, 40]);
  assert.deepEqual(Array.from(png.data.subarray(0, 4)), color);
}

async function main() {
  assert(['app', 'docker', 'lambda'].includes(targetName));
  assert(['static', 'dev'].includes(mode));
  const baseUrl =
    mode === 'dev' ? 'http://localhost:6006' : `file:${project}/dist`;
  if (mode === 'dev') await waitForServer(`${baseUrl}/iframe.html`);
  const target =
    targetName === 'lambda'
      ? createLambdaTarget()
      : { app: createChromeAppTarget, docker: createChromeDockerTarget }[
          targetName
        ]({ baseUrl });
  const asset = path.join(
    project,
    mode === 'dev' ? 'public' : 'dist',
    'fixture.svg'
  );
  const original = fs.readFileSync(asset);
  try {
    if (target.prepare) await target.prepare();
    await target.start(
      targetName === 'app'
        ? {
            chromeFlags: [
              '--headless',
              '--disable-gpu',
              '--hide-scrollbars',
              '--no-sandbox',
            ],
          }
        : undefined
    );
    const stories = await target.getStorybook();
    assert.deepEqual(stories.map(({ id }) => id).sort(), ids);

    const capture = () =>
      target.captureScreenshotForStory(ids[0], options, configuration, {});
    const baseline = await capture();
    checkPng(baseline);
    const compareOptions = {
      diffingEngine: 'pixelmatch',
      requireReference: true,
      referenceDir: path.join(results, 'reference'),
      outputDir: path.join(results, 'current'),
      differenceDir: path.join(results, 'difference'),
    };
    const args = [0, 'chrome', 'Compatibility/Button', 'Primary', {}];
    await compareScreenshot(
      baseline,
      { ...compareOptions, updateReference: true },
      ...args
    );
    const { referencePath, diffPath } = getOutputPaths(
      compareOptions,
      'chrome',
      'Compatibility/Button',
      'Primary',
      {}
    );
    const reference = fs.readFileSync(referencePath);
    await compareScreenshot(await capture(), compareOptions, ...args);

    fs.writeFileSync(asset, original.toString().replace('#663399', '#ff9900'));
    const changed = await capture();
    checkPng(changed, [255, 153, 0, 255]);
    await assert.rejects(
      () => compareScreenshot(changed, compareOptions, ...args),
      /Screenshot differs from reference/
    );
    assert(fs.existsSync(diffPath), 'Missing visual difference');
    assert(
      fs.readFileSync(referencePath).equals(reference),
      'Reference was overwritten'
    );
    fs.writeFileSync(asset, original);

    if (targetName === 'lambda') {
      const batch = await target.captureScreenshotsForStories(
        ids.map((id) => ({ id, configuration, parameters: {} })),
        { ...options, chromeAwsLambdaBatchConcurrency: 2 }
      );
      assert.equal(batch.length, ids.length);
      batch.forEach((buffer) => checkPng(buffer));
    }
    console.log(`PASS ${fixture} / ${targetName} / ${mode}`);
  } finally {
    fs.writeFileSync(asset, original);
    await target.stop();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
