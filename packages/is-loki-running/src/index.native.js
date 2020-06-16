module.exports = function isLokiRunning(win = global) {
  // eslint-disable-next-line no-underscore-dangle
  return Boolean(win.loki && win.loki.isRunning);
};
