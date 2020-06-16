/* eslint-env browser */

module.exports = function isLokiRunning(win = window) {
  // eslint-disable-next-line no-underscore-dangle
  return Boolean(win.loki && win.loki.isRunning);
};
