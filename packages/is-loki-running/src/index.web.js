/* eslint-env browser */

module.exports = function isLokiRunning(win = window) {
  return Boolean(win.loki && win.loki.isRunning);
};
