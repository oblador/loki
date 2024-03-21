/* eslint-disable no-underscore-dangle */

const getStories = async (window) => {
  const getStorybook =
    (window.__STORYBOOK_CLIENT_API__ && window.__STORYBOOK_CLIENT_API__.raw) ||
    (window.__STORYBOOK_PREVIEW__ && window.__STORYBOOK_PREVIEW__.extract && window.__STORYBOOK_PREVIEW__.storyStore.raw) ||
    (window.loki && window.loki.getStorybook);
  if (!getStorybook) {
    throw new Error(
      "Unable to get stories. Try adding `import 'loki/configure-react'` to your .storybook/preview.js file."
    );
  }
  const blockedParams = [
    'actions',
    'argTypes',
    'backgrounds',
    'controls',
    'docs',
    'framework',
    'storySource',
  ];

  const isSerializable = (value) => {
    try {
      JSON.stringify(value);
      return true;
    } catch (_e) {
      return false;
    }
  };

  if (window.__STORYBOOK_PREVIEW__ && window.__STORYBOOK_PREVIEW__.extract) {
    // New official API to extract stories from preview
    await window.__STORYBOOK_PREVIEW__.extract();

    // Deprecated, will be removed in V9
    const stories = window.__STORYBOOK_PREVIEW__.storyStore.raw();

    return stories
      .map((component) => ({
        id: component.id,
        kind: component.kind,
        story: component.story,
        parameters: Object.fromEntries(
          Object.entries(component.parameters || {}).filter(
            ([key, value]) =>
              !key.startsWith('__') &&
              !blockedParams.includes(key) &&
              isSerializable(value)
          )
        ),
      }))
      .filter(({ parameters }) => !parameters.loki || !parameters.loki.skip);
  }

  if (
    window.__STORYBOOK_CLIENT_API__.storyStore &&
    window.__STORYBOOK_CLIENT_API__.storyStore.cacheAllCSFFiles
  ) {
    await window.__STORYBOOK_CLIENT_API__.storyStore.cacheAllCSFFiles();
  }

  return getStorybook()
    .map((component) => ({
      id: component.id,
      kind: component.kind,
      story: component.story,
      parameters: Object.fromEntries(
        Object.entries(component.parameters || {}).filter(
          ([key, value]) =>
            !key.startsWith('__') &&
            !blockedParams.includes(key) &&
            isSerializable(value)
        )
      ),
    }))
    .filter(({ parameters }) => !parameters.loki || !parameters.loki.skip);
};

module.exports = getStories;
