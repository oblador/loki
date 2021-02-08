const { NativeError } = require('@loki/core');

const createMessageQueue = (nativeErrorType) => {
  const queue = [];

  const waitFor = (type, condition) =>
    new Promise((resolve, reject) => {
      queue.push({ type, condition, resolve, reject });
    });

  const receiveMessage = (type, args) => {
    const isError = type === nativeErrorType;
    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      if (
        (isError || item.type === type) &&
        (!item.condition || item.condition(...args))
      ) {
        if (isError) {
          const { error, isFatal } = args[0];
          item.reject(new NativeError(error.message, error.stack, isFatal));
        } else {
          item.resolve(args[0]);
        }
        queue.splice(i, 1);
        break;
      }
    }
  };

  const rejectAll = (err) => {
    queue.forEach((item) => item.reject(err));
    queue.splice(0, queue.length);
  };

  const rejectAllOfType = (type, err) => {
    for (let i = queue.length - 1; i >= 0; i--) {
      const item = queue[i];
      item.reject(err);
      queue.splice(i, 1);
    }
  };

  return { waitFor, receiveMessage, rejectAll, rejectAllOfType };
};

module.exports = createMessageQueue;
