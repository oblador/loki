/* eslint prefer-arrow-callback: 0, no-var: 0, object-shorthand: 0 */
// Diverge from rules for UglifyJS

function createReadyStateManager() {
  var pendingPromises = [];

  function registerPendingPromise(promise) {
    pendingPromises.push(promise);
  }

  function resetPendingPromises() {
    pendingPromises = [];
  }

  function awaitReady() {
    return Promise.all(pendingPromises.splice(0)).then(function () {
      if (pendingPromises.length) {
        return awaitReady();
      }
      return true;
    });
  }

  return {
    registerPendingPromise: registerPendingPromise,
    resetPendingPromises: resetPendingPromises,
    awaitReady: awaitReady,
  };
}

module.exports = createReadyStateManager;
