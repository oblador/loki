/* eslint-env browser */

module.exports = function createAsyncCallback(win = window) {
  const registerPendingPromise = win.loki && win.loki.registerPendingPromise;
  let resolveAsyncStory;
  if (registerPendingPromise) {
    registerPendingPromise(
      new Promise((resolve) => {
        resolveAsyncStory = resolve;
      })
    );
  }

  return () => {
    if (resolveAsyncStory) {
      resolveAsyncStory();
    }
  };
};
