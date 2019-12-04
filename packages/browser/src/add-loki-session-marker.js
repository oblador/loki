const addLokiSessionMarker = window => {
  window.document.querySelector(':root').setAttribute('loki-test', true);
  /* eslint-disable no-underscore-dangle, no-param-reassign */
  window._isLokiTest = true;
};

module.exports = addLokiSessionMarker;
