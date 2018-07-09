const getSelectorBoxSize = (window, selector) => {
  const elements = [...window.document.querySelectorAll(selector)];

  if (elements.length === 0) {
    throw new Error('Unable to find selector');
  }

  const isNotWrapperElement = element => {
    const isWrapper = elements.some(
      node => (node === element ? false : element.contains(node))
    );
    return !isWrapper;
  };

  const getBoundingClientRect = element => element.getBoundingClientRect();

  const boxSizeUnion = (domRect, { x, y, width, height }) => {
    if (!domRect) {
      return { x, y, width, height };
    }

    const xMin = Math.min(domRect.x, x);
    const yMin = Math.min(domRect.y, y);

    const xMax = Math.max(domRect.x + domRect.width, x + width);
    const yMax = Math.max(domRect.y + domRect.height, y + height);

    return {
      x: xMin,
      y: yMin,
      width: xMax - xMin,
      height: yMax - yMin,
    };
  };

  return elements
    .filter(isNotWrapperElement)
    .map(getBoundingClientRect)
    .reduce(boxSizeUnion);
};

module.exports = getSelectorBoxSize;
