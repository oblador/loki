function decorateStorybook(storybook) {
  const originalStoriesOf = storybook.storiesOf;
  const skippedStories = {};

  function storiesOf(kind, module) {
    const stories = originalStoriesOf(kind, module);
    stories.add.skip = function skip(story, storyFn) {
      if (!skippedStories[kind]) {
        skippedStories[kind] = [];
      }
      skippedStories[kind].push(story);
      return stories.add(story, storyFn);
    };
    return stories;
  }

  /* eslint no-param-reassign: ["error", { "props": false }] */
  storybook.storiesOf = storiesOf;

  function getStorybook() {
    // Diverge from regular rules here to not mess with UglifyJS
    /* eslint object-shorthand: 0, prefer-arrow-callback: 0, func-names: 0 */
    return storybook.getStorybook().map(function(component) {
      const kind = component.kind;
      const stories = component.stories;
      const skipped = skippedStories[kind];
      if (skipped) {
        return {
          kind: kind,
          skipped: skipped,
          stories: stories.filter(function(story) {
            return skipped.indexOf(story.name) === -1;
          }),
        };
      }
      return component;
    });
  }

  return getStorybook;
}

module.exports = decorateStorybook;
