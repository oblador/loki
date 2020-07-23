const getStories = window => {
  const getStorybook = window.loki && window.loki.getStorybook;
  if (!getStorybook) {
    throw new Error(
      "Loki addon not registered. Add `import 'loki/configure-react'` to your .storybook/preview.js file."
    );
  }
  return getStorybook().map(component => ({
    id: component.id,
    kind: component.kind,
    story: component.story,
    parameters: component.parameters.loki || {},
  }));
};

module.exports = getStories;
