/* eslint object-shorthand: 0, prefer-arrow-callback: 0, no-var: 0, no-console: 0 */
// Diverge from regular rules here to not mess with UglifyJS

const readyStateManager = require('./ready-state-manager');

let warnedSkipDeprecation = false;
let warnedAsyncDeprecation = false;

function decorateStorybook(storybook) {
  const originalStoriesOf = storybook.storiesOf;
  const skippedStories = {};

  function wrapWithSkipStory(add, kind, isDeprecatedCall) {
    return function skipStory(story, storyFn, parameters) {
      if (isDeprecatedCall && !warnedSkipDeprecation) {
        warnedSkipDeprecation = true;
        console.warn(
          '[DEPRECATED] `.add.skip(...)` is deprecated. Please use `.lokiSkip(...)` instead.'
        );
      }

      if (!skippedStories[kind]) {
        skippedStories[kind] = [];
      }
      skippedStories[kind].push(story);

      return add(story, storyFn, parameters);
    };
  }

  function wrapWithAsyncStory(add, isDeprecatedCall) {
    return function skipStory(story, storyFn, parameters) {
      if (isDeprecatedCall && !warnedAsyncDeprecation) {
        warnedAsyncDeprecation = true;
        console.warn(
          '[DEPRECATED] `.add.async(...)` is deprecated. Please use `.lokiAsync(...)` instead.'
        );
      }

      return add(
        story,
        function render(context) {
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
        },
        parameters
      );
    };
  }

  function storiesOf(kind, module) {
    const stories = originalStoriesOf(kind, module);
    stories.add.skip = wrapWithSkipStory(stories.add.bind(stories), kind, true);
    stories.add.async = wrapWithAsyncStory(stories.add.bind(stories), true);
    stories.add.async.skip = wrapWithSkipStory(stories.add.async, kind, true);
    stories.add.skip.async = wrapWithAsyncStory(stories.add.skip, true);

    return stories;
  }

  // Monkey patch storiesOf to be able to add async/skip methods
  const descriptor = Object.getOwnPropertyDescriptor(storybook, 'storiesOf');
  if (descriptor.writable) {
    /* eslint no-param-reassign: ["error", { "props": false }] */
    storybook.storiesOf = storiesOf;
  } else if (descriptor.configurable) {
    // In recent versions of storybook object this isn't writeable, probably due to babel transpilation changes
    Object.defineProperty(storybook, 'storiesOf', {
      configurable: true,
      enumerable: true,
      get: function() {
        return storiesOf;
      },
    });
  }

  storybook.setAddon({
    lokiSkip: function(...args) {
      return wrapWithSkipStory(this.add.bind(this), this.kind)(...args);
    },
    lokiAsync: function(...args) {
      return wrapWithAsyncStory(this.add.bind(this))(...args);
    },
    lokiAsyncSkip: function(...args) {
      return wrapWithSkipStory(
        wrapWithAsyncStory(this.add.bind(this)),
        this.kind
      )(...args);
    },
  });

  function getStorybook() {
    return storybook.getStorybook().map(function(component) {
      const { kind, stories } = component;
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
