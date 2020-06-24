module.exports = function isLokiRunning(win = global) {
  return Boolean(win.loki && win.loki.isRunning);
};
