const { registerPendingPromise } = require('@loki/integration-core');

module.exports = function createAsyncCallback() {
  let resolveAsyncStory;
  registerPendingPromise(
    new Promise(function(resolve) {
      resolveAsyncStory = resolve;
    })
  );
  return () => {
    if (resolveAsyncStory) {
      resolveAsyncStory();
    }
  };
};
