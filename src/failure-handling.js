const withTimeout = timeout => fn => (...args) =>
  new Promise(async (resolve, reject) => {
    let cancelled = false;
    const timer = setTimeout(() => {
      cancelled = true;
      reject(new Error(`Operation timed out after ${timeout}ms`));
    }, timeout);
    const result = await fn(...args);
    if (!cancelled) {
      clearTimeout(timer);
      resolve(result);
    }
  });

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

module.exports = { withTimeout, withRetries };
