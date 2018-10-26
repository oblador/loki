const addLokiSessionMarker = window =>
  window.document.querySelector(':root').setAttribute('loki-tests', true);

module.exports = addLokiSessionMarker;
