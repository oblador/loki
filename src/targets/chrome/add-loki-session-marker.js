const addLokiSessionMarker = window =>
  window.document.querySelector(':root').setAttribute('loki-test', true);

module.exports = addLokiSessionMarker;
