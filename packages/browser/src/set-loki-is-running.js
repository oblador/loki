/* eslint-disable no-param-reassign */

const setLokiIsRunning = window => {
  if (!window.loki) {
    window.loki = {};
  }
  window.loki.isRunning = true;
};

module.exports = setLokiIsRunning;
