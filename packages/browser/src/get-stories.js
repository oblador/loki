/* eslint-disable no-underscore-dangle */

const getStories = (window) => {
  const getStorybook =
    (window.__STORYBOOK_CLIENT_API__ && window.__STORYBOOK_CLIENT_API__.raw) ||
    (window.loki && window.loki.getStorybook);
  if (!getStorybook) {
    throw new Error(
      "Unable to get stories. Try adding `import 'loki/configure-react'` to your .storybook/preview.js file."
    );
  }
  return getStorybook()
    .map((component) => ({
      id: component.id,
      kind: component.kind,
      story: component.story,
      parameters: component.parameters.loki || {},
    }))
    .filter(({ parameters }) => !parameters.skip);
};

module.exports = getStories;
