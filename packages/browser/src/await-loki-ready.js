const awaitLokiReady = (window) =>
  window.loki && window.loki.awaitReady && window.loki.awaitReady();

module.exports = awaitLokiReady;
