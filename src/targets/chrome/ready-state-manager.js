let pendingPromises = [];

function registerPendingPromise(promise) {
  pendingPromises.push(promise);
}

function resetPendingPromises() {
  pendingPromises = [];
}

function awaitReady() {
  return Promise.all(pendingPromises.splice(0)).then(() => {
    if (pendingPromises.length) {
      return awaitReady();
    }
    return true;
  });
}

const asString = `
((window) => {
  let pendingPromises = [];
  ${registerPendingPromise}
  ${resetPendingPromises}
  ${awaitReady}
  if (!window.loki) {
    window.loki = {};
  }
  window.loki.registerPendingPromise = registerPendingPromise;
  window.loki.resetPendingPromises = resetPendingPromises;
  window.loki.awaitReady = awaitReady;
})(window)`;

module.exports = {
  registerPendingPromise,
  resetPendingPromises,
  awaitReady,
  asString,
};
