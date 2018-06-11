const getSelectorBoxSize = (window, selector) => {
  const element = window.document.querySelector(selector);
  if (!element) {
    throw new Error('Unable to find element');
  }
  const { x, y, width, height } = element.getBoundingClientRect();
  return { x, y, width, height };
};

module.exports = getSelectorBoxSize;
