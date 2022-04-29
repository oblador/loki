const dockerLambda = require('docker-lambda');
const path = require('path');
const fs = require('fs');

const DOCKER_TEST_TIMEOUT = 60000;

const PROJECT_ROOT = path.dirname(path.dirname(path.dirname(__dirname)));

const DEBUG = false;

const executeLambda = (event) =>
  dockerLambda({
    event,
    dockerArgs: ['-m', '1024M'].concat(DEBUG ? ['-e', 'DEBUG=*'] : []),
    dockerImage: 'lambci/lambda:nodejs12.x',
    taskDir: PROJECT_ROOT,
    handler: 'examples/renderer-aws-lambda/index.handler',
    returnSpawnResult: DEBUG,
  });

const fetchStorybookUrl = async (baseUrl) =>
  executeLambda({
    command: 'getStorybook',
    baseUrl,
  });

const getStorybookFixtureUrl = (fixture) =>
  `file:./fixtures/storybook-${fixture}`;

const fetchStorybookScreenshot = async (fixture, id) =>
  executeLambda({
    command: 'captureScreenshotForStory',
    baseUrl: getStorybookFixtureUrl(fixture),
    id,
    options: {
      chromeLoadTimeout: 60000,
      chromeSelector: '#root > *',
    },
    configuration: {
      preset: 'iPhone 7',
      chromeRetries: 0,
    },
  });

const fetchStorybookFixture = async (fixture) =>
  fetchStorybookUrl(getStorybookFixtureUrl(fixture));

const storybook = [
  {
    id: 'example-button--large',
    kind: 'Example/Button',
    story: 'Large',
    parameters: {
      args: {
        label: 'Button',
        size: 'large',
      },
      fileName: './src/stories/Button.stories.jsx',
      globals: {
        measureEnabled: false,
        outline: false,
      },
    },
  },
  {
    id: 'example-button--primary',
    kind: 'Example/Button',
    story: 'Primary',
    parameters: {
      args: {
        label: 'Button',
        primary: true,
      },
      fileName: './src/stories/Button.stories.jsx',
      globals: {
        measureEnabled: false,
        outline: false,
      },
    },
  },
  {
    id: 'example-button--secondary',
    kind: 'Example/Button',
    story: 'Secondary',
    parameters: {
      args: {
        label: 'Button',
      },
      fileName: './src/stories/Button.stories.jsx',
      globals: {
        measureEnabled: false,
        outline: false,
      },
    },
  },
  {
    id: 'example-button--small',
    kind: 'Example/Button',
    story: 'Small',
    parameters: {
      args: {
        label: 'Button',
        size: 'small',
      },
      fileName: './src/stories/Button.stories.jsx',
      globals: {
        measureEnabled: false,
        outline: false,
      },
    },
  },
];

describe('createChromeAWSLambdaRenderer', () => {
  describe('.getStorybook', () => {
    it(
      'fetches stories from static bundles',
      async () => {
        expect(await fetchStorybookFixture('static')).toEqual(storybook);
      },
      DOCKER_TEST_TIMEOUT
    );

    it(
      'throws if not configured',
      async () => {
        await expect(fetchStorybookFixture('unconfigured')).rejects.toThrow(
          "Unable to get stories. Try adding `import 'loki/configure-react'` to your .storybook/preview.js file."
        );
      },
      DOCKER_TEST_TIMEOUT
    );

    it(
      'throws if not running',
      async () => {
        await expect(
          fetchStorybookUrl('http://localhost:23456')
        ).rejects.toThrow('Failed fetching stories because the server is down');
      },
      DOCKER_TEST_TIMEOUT
    );
  });

  describe('.captureScreenshotForStory', () => {
    it(
      'captures screenshot',
      async () => {
        const screenshot = await fetchStorybookScreenshot(
          'static',
          'example-button--large'
        );
        const referencePath = path.resolve(
          __dirname,
          '../__snapshots__/example-button-large.png'
        );
        fs.writeFileSync(referencePath, Buffer.from(screenshot, 'base64'));
        const reference = fs.readFileSync(referencePath);
        expect(screenshot).toEqual(reference.toString('base64'));
      },
      DOCKER_TEST_TIMEOUT
    );
  });

  describe('.captureScreenshotsForStories', () => {
    it(
      'captures screenshots',
      async () => {
        const [screenshot] = await executeLambda({
          command: 'captureScreenshotsForStories',
          baseUrl: getStorybookFixtureUrl('static'),
          stories: [
            {
              id: 'example-button--large',
              kind: 'Example/Button',
              story: 'Large',
              configuration: {
                preset: 'iPhone 7',
                chromeRetries: 0,
              },
            },
          ],
          options: {
            chromeLoadTimeout: 60000,
            chromeSelector: '#root > *',
          },
        });

        const referencePath = path.resolve(
          __dirname,
          '../__snapshots__/example-button-large.png'
        );
        const reference = fs.readFileSync(referencePath);
        expect(screenshot).toEqual(reference.toString('base64'));
      },
      DOCKER_TEST_TIMEOUT
    );
  });
});
