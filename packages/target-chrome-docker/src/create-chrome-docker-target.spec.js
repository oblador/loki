const { createChromeDockerTarget } = require('.');

const DOCKER_TEST_TIMEOUT = 120000;

const fetchStorybookUrl = async (baseUrl) => {
  const target = createChromeDockerTarget({ baseUrl });
  await target.start();
  let result;
  try {
    result = await target.getStorybook({ baseUrl });
  } catch (err) {
    result = err;
  }
  await target.stop();
  if (result instanceof Error) {
    throw result;
  }
  return result;
};

const fetchStorybookFixture = async (fixture) =>
  fetchStorybookUrl(`file:${__dirname}/../../../fixtures/storybook-${fixture}`);

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

describe('createChromeTarget', () => {
  describe('.getStorybook', () => {
    it(
      'fetches stories from webpack dynamic bundles',
      async () => {
        expect(await fetchStorybookFixture('dynamic')).toEqual(storybook);
      },
      DOCKER_TEST_TIMEOUT
    );

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
});
