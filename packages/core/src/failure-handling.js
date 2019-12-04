const { TimeoutError } = require('./errors');

const withTimeout = (timeout, operationName) => fnOrPromise => {
  const awaitPromise = promise =>
    new Promise(async (resolve, reject) => {
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
  let lastError;
  while (tries <= maxRetries) {
    tries++;
    try {
      const result = await fn(...args);
      return result;
    } catch (err) {
      lastError = err;
    }
  }
  const message = lastError.message || lastError.toString();
  const error = new Error(`Failed with "${message}" after ${tries} tries`);
  error.originalError = lastError;
  throw error;
};

function unwrapError(rawError) {
  let error = rawError;

  // Unwrap retry/timeout errors
  while (error.originalError) {
    error = error.originalError;
  }

  return error;
}

module.exports = { withTimeout, withRetries, unwrapError };
