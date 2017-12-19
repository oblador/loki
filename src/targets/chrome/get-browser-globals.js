const { JSDOM, VirtualConsole } = require('jsdom');

function getBrowserGlobals(html) {
  const dom = new JSDOM(html, {
    virtualConsole: new VirtualConsole(),
    pretendToBeVisual: true,
  });
  const { window } = dom;
  const noop = function noop() {};

  const EventSource = function() {
    this.close = noop;
  };

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

  const globals = Object.assign({}, window, {
    navigator,
    localStorage,
    matchMedia,
    EventSource,
    setImmediate: noop,
    clearImmediate: noop,
  });
  globals.window = globals;
  globals.global = globals;

  return globals;
}

module.exports = getBrowserGlobals;
