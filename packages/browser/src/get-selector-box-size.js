const flatten = arr =>
  arr.reduce(
    (flat, item) => [
      ...flat,
      ...(Array.isArray(item) ? flatten(item) : [item]),
    ],
    []
  );

const getSelectorBoxSize = (window, selector) => {
  const isNotWrapperElement = (element, index, array) => {
    const isWrapper = array.some(node =>
      node === element ? false : element.contains(node)
    );
    return !isWrapper;
  };

  const isVisible = element => {
    const style = window.getComputedStyle(element);

    return !(
      style.visibility === 'hidden' ||
      style.display === 'none' ||
      style.opacity === '0' ||
      ((style.width === '0px' || style.height === '0px') &&
        style.padding === '0px')
    );
  };

  const findFirstVisibleElements = node => {
    if (node.children.length > 0 && !isVisible(node)) {
      return flatten(Array.from(node.children).map(findFirstVisibleElements));
    }

    return [node];
  };

  const elements = flatten(
    Array.from(window.document.querySelectorAll(selector))
      .filter(isNotWrapperElement)
      .map(findFirstVisibleElements)
  ).filter(isVisible);

  if (elements.length === 0) {
    throw new Error('No visible elements found');
  }

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

  return elements.map(getBoundingClientRect).reduce(boxSizeUnion);
};

module.exports = getSelectorBoxSize;
