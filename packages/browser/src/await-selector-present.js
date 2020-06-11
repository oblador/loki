const awaitSelectorPresent = (window, selector, timeout = 10000) =>
  new Promise((resolve, reject) => {
    let resolutionTimer;
    const rejectionTimer = setTimeout(() => {
      clearTimeout(resolutionTimer);
      reject(new Error(`Timeout after ${timeout}ms`));
    }, timeout);

    const waitForSelector = () => {
      if (window.document.querySelector(selector)) {
        clearTimeout(rejectionTimer);
        resolve();
      } else {
        resolutionTimer = setTimeout(waitForSelector, 100);
      }
    };

    waitForSelector();
  });

module.exports = awaitSelectorPresent;
