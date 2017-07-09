const createMessageQueue = () => {
  const queue = [];

  const waitFor = (type, condition) =>
    new Promise((resolve, reject) => {
      queue.push({ type, condition, resolve, reject });
    });

  const receiveMessage = (type, args) => {
    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      if (item.type === type && (!item.condition || item.condition(...args))) {
        item.resolve(args[0]);
        queue.splice(i, 1);
        break;
      }
    }
  };

  const rejectAll = err => {
    queue.forEach(item => item.reject(err));
    queue.splice(0, queue.length);
  };

  return { waitFor, receiveMessage, rejectAll };
};

module.exports = createMessageQueue;
