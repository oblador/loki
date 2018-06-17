/* eslint object-shorthand: 0, prefer-arrow-callback: 0, no-var: 0 */
// Diverge from regular rules here to not mess with UglifyJS

const readyStateManager = require('./ready-state-manager');

function decorateStorybook(storybook) {
  const originalStoriesOf = storybook.storiesOf;
  const skippedStories = {};

  function wrapWithSkipStory(add, kind) {
    return function skipStory(story, storyFn) {
      if (!skippedStories[kind]) {
        skippedStories[kind] = [];
      }
      skippedStories[kind].push(story);

      return add(story, storyFn);
    };
  }

  function wrapWithAsyncStory(add) {
    return function skipStory(story, storyFn) {
      return add(story, function render(context) {
        var resolveAsyncStory = null;
        readyStateManager.resetPendingPromises();
        readyStateManager.registerPendingPromise(
          new Promise(function(resolve) {
            resolveAsyncStory = resolve;
          })
        );

        const done = function() {
          if (resolveAsyncStory) {
            resolveAsyncStory();
          }
          resolveAsyncStory = null;
        };

        return storyFn(Object.assign({ done: done }, context));
      });
    };
  }

  function storiesOf(kind, module) {
    const stories = originalStoriesOf(kind, module);
    stories.add.skip = wrapWithSkipStory(stories.add.bind(stories), kind);
    stories.add.async = wrapWithAsyncStory(stories.add.bind(stories));
    stories.add.async.skip = wrapWithSkipStory(stories.add.async, kind);
    stories.add.skip.async = wrapWithAsyncStory(stories.add.skip);

    return stories;
  }

  // Monkey patch storiesOf to be able to add async/skip methods
  const descriptor = Object.getOwnPropertyDescriptor(storybook, 'storiesOf');
  if (descriptor.writable) {
    /* eslint no-param-reassign: ["error", { "props": false }] */
    storybook.storiesOf = storiesOf;
  } else {
    Object.defineProperty(storybook, 'storiesOf', {
      configurable: true,
      enumerable: true,
      get: function() {
        return storiesOf;
      },
    });
  }

  function getStorybook() {
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
