/* eslint object-shorthand: 0, prefer-arrow-callback: 0, no-var: 0, no-console: 0 */
// Diverge from regular rules here to not mess with UglifyJS

let warnedSkipDeprecation = false;
let warnedAsyncDeprecation = false;

function decorateStorybook(storybook, readyStateManager) {
  const originalStoriesOf = storybook.storiesOf;

  function wrapWithSkipStory(add) {
    return function skipStory(story, storyFn, parameters = {}) {
      if (!warnedSkipDeprecation) {
        warnedSkipDeprecation = true;
        console.warn(
          '[DEPRECATED] `.add.skip(...)` and `.lokiSkip(...)` are deprecated. Please pass `{ loki: { skip: true } }` in the third parameter instead.'
        );
      }

      return add(story, storyFn, {
        ...parameters,
        loki: {
          ...(parameters.loki || {}),
          skip: true,
        },
      });
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
            new Promise(function (resolve) {
              resolveAsyncStory = resolve;
            })
          );

          const done = function () {
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
    stories.add.skip = wrapWithSkipStory(stories.add.bind(stories), kind);
    stories.add.async = wrapWithAsyncStory(stories.add.bind(stories), true);
    stories.add.async.skip = wrapWithSkipStory(stories.add.async, kind);
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
      get: function () {
        return storiesOf;
      },
    });
  }

  storybook.setAddon({
    lokiSkip: function (...args) {
      return wrapWithSkipStory(this.add.bind(this), this.kind)(...args);
    },
    lokiAsync: function (...args) {
      return wrapWithAsyncStory(this.add.bind(this))(...args);
    },
    lokiAsyncSkip: function (...args) {
      return wrapWithSkipStory(
        wrapWithAsyncStory(this.add.bind(this)),
        this.kind
      )(...args);
    },
  });

  function getStorybook() {
    return storybook
      .raw()
      .filter(
        ({ parameters }) =>
          !parameters || !parameters.loki || !parameters.loki.skip
      );
  }

  return getStorybook;
}

module.exports = decorateStorybook;
