/* eslint no-param-reassign: ["error", { "props": false }] */

function populateLokiHelpers(window, helpers = {}) {
  window.loki = Object.assign({}, helpers, window.loki || {});
}

module.exports = populateLokiHelpers;
