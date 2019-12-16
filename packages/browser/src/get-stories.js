const getStories = window => {
  const getStorybook = window.loki && window.loki.getStorybook;
  if (!getStorybook) {
    throw new Error(
      "Loki addon not registered. Add `import 'loki/configure-react'` to your config.js file."
    );
  }
  return getStorybook().map(component => ({
    kind: component.kind,
    stories: component.stories.map(story => story.name),
    skipped: component.skipped,
  }));
};

module.exports = getStories;
