const {
  registerPendingPromise,
} = require('@loki/integration-react-native/src/ready-state-manager');

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
