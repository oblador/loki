const { JSDOM } = require('jsdom');

function getBrowserGlobals(html) {
  const dom = new JSDOM(html);
  const { window } = dom;
  const noop = function noop() {};

  const EventSource = noop;

  const navigator = {
    userAgent: 'loki',
  };

  let localStorageData = {};
  const localStorage = {
    setItem(id, val) {
      localStorageData[id] = String(val);
    },
    getItem(id) {
      return localStorageData[id] ? localStorageData[id] : undefined;
    },
    removeItem(id) {
      delete localStorageData[id];
    },
    clear() {
      localStorageData = {};
    },
  };

  const matchMedia = () => ({ matches: true });

  window.EventSource = EventSource;

  const globals = Object.assign({}, window, {
    navigator,
    localStorage,
    matchMedia,
    EventSource,
    setInterval: noop,
    console: {
      log: noop,
      warn: noop,
      error: noop,
    },
  });
  globals.global = globals;

  return globals;
}

module.exports = getBrowserGlobals;
