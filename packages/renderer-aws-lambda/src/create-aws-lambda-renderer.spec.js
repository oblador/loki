const path = require('path');
const fs = require('fs');
const got = require('got');

const DOCKER_TEST_TIMEOUT = 60000;
// https://docs.aws.amazon.com/lambda/latest/dg/images-test.html#images-test-AWSbase
const DOCKER_LAMBDA_URL =
  'http://localhost:8080/2015-03-31/functions/function/invocations';

const executeLambda = async (event) => {
  const url = DOCKER_LAMBDA_URL;

  const result = await got
    .post(url, {
      json: event,
    })
    .json();

  return result;
};

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
        expect(await fetchStorybookFixture('unconfigured')).toEqual({
          errorMessage:
            '{"isSerializedError":true,"type":"Error","args":["Unable to get stories. Try adding `import \'loki/configure-react\'` to your .storybook/preview.js file."]}',
          errorType: 'string',
          trace: [],
        });
      },
      DOCKER_TEST_TIMEOUT
    );

    it(
      'throws if not running',
      async () => {
        expect(await fetchStorybookUrl('http://localhost:23456')).toEqual({
          errorMessage:
            '{"isSerializedError":true,"type":"ServerError","args":["Failed fetching stories because the server is down","Try starting it with \\"yarn storybook\\" or pass the --port or --host arguments if it\'s not running at http://localhost:23456"]}',
          errorType: 'string',
          trace: [],
        });
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
