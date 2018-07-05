const getSelectorBoxSize = (window, selector) => {
  const elements = window.document.querySelectorAll(selector);
  if (elements.length === 0) {
    throw new Error('Unable to find selector');
  }

  return Array.from(elements, element =>
    element.getBoundingClientRect()
  ).reduce((accumulator, { x, y, width, height }) => {
    if (!accumulator) {
      return { x, y, width, height };
    }

    const xMin = Math.min(accumulator.x, x);
    const yMin = Math.min(accumulator.y, y);

    const xMax = Math.max(accumulator.x + accumulator.width, x + width);
    const yMax = Math.max(accumulator.y + accumulator.height, y + height);

    return {
      x: xMin,
      y: yMin,
      width: xMax - xMin,
      height: yMax - yMin,
    };
  });
};

module.exports = getSelectorBoxSize;
