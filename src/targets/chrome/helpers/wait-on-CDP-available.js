const waitOn = require('wait-on');

/**
 * Waits for the Chrome DevTools Protocol to be available. It will timeout after 5 seconds.
 * @param host The host where to look for CDP
 * @param port THe port where to look for CDP
 * @returns {Promise} Will resolve without content when CDP is available or error out otherwise
 */
module.exports = function waitOnCDPAvailable (host, port) {
  return new Promise((resolve, reject) => {
    waitOn(
      {
        resources: [`tcp:${host}:${port}`],
        delay: 50,
        interval: 100,
        timeout: 5000,
      },
      err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
}
