const fetchStorybook = require('./fetch-storybook');

const fetchFixture = fixture =>
  fetchStorybook(`file:${__dirname}/fixtures/storybook-${fixture}`);

const storybook = [
  {
    kind: 'Welcome',
    stories: ['to Storybook'],
  },
  {
    kind: 'Button',
    stories: ['with text', 'with some emoji'],
    skipped: ['skipped story'],
  },
];

describe('fetchStorybook', () => {
  it('fetches stories from webpack dynamic bundles', async () => {
    expect(await fetchFixture('dynamic')).toEqual(storybook);
  });

  it('fetches stories from static bundles', async () => {
    expect(await fetchFixture('static')).toEqual(storybook);
  });

  it('throws if not configured', async () => {
    await expect(fetchFixture('unconfigured')).rejects.toEqual(
      new Error(
        "Loki addon not registered. Add `import 'loki/configure-react'` to your config.js file."
      )
    );
  });
});
