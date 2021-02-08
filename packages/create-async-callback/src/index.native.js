const {
  registerPendingPromise,
} = require('@loki/integration-react-native/src/ready-state-manager');

module.exports = function createAsyncCallback() {
  let resolveAsyncStory;
  registerPendingPromise(
    new Promise((resolve) => {
      resolveAsyncStory = resolve;
    })
  );
  return () => {
    if (resolveAsyncStory) {
      resolveAsyncStory();
    }
  };
};
