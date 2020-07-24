/* eslint-env browser */

module.exports = function createAsyncCallback(win = window) {
  const registerPendingPromise = win.loki && win.loki.registerPendingPromise;
  let resolveAsyncStory;
  if (registerPendingPromise) {
    registerPendingPromise(
      new Promise(function(resolve) {
        resolveAsyncStory = resolve;
      })
    );
  } else {
    console.warn('Loki is not correctly configured');
  }
  return () => {
    if (resolveAsyncStory) {
      resolveAsyncStory();
    }
  };
};
