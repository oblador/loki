/* eslint-disable no-param-reassign */

const setLokiTestAttribute = (window) => {
  window.document.querySelector(':root').setAttribute('loki-test', true);
};

module.exports = setLokiTestAttribute;
