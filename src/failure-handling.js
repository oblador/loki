const { TimeoutError } = require('./errors');

const withTimeout = (timeout, operationName) => fnOrPromise => {
  const awaitPromise = promise => new Promise(async (resolve, reject) => {
    let cancelled = false;
    const timer = setTimeout(() => {
      cancelled = true;
      reject(new TimeoutError(timeout, operationName));
    }, timeout);
    try {
      const result = await promise;
      if (!cancelled) {
        clearTimeout(timer);
        resolve(result);
      }
    } catch (err) {
      if (!cancelled) {
        clearTimeout(timer);
        reject(err);
      }
    }
  });

  if (typeof fnOrPromise === 'function') {
    return (...args) => awaitPromise(fnOrPromise(...args));
  }
  return awaitPromise(fnOrPromise);
};


const withRetries = (maxRetries = 3) => fn => async (...args) => {
  let tries = 0;
  while (true) {
    tries++;
    try {
      const result = await fn(...args);
      return result;
    } catch (err) {
      if (tries > maxRetries) {
        const error = new Error(`Failed with "${err}" after ${tries} tries`);
        error.originalError = err;
        throw error;
      }
    }
  }
};

module.exports = { withTimeout, withRetries, TimeoutError };
