const getSelectorBoxSize = (window, selector) => {
  const isOverflowHidden = element => {
    const containerStyle = window.getComputedStyle(element.parentElement);

    if (['visible', 'initial', 'inherit'].includes(containerStyle.overflow)) {
      return false;
    }

    try {
      const elementRect = element.getBoundingClientRect();
      const containerRect = element.parentElement.getBoundingClientRect();
      const top = elementRect.top < containerRect.top;
      const bottom = elementRect.bottom > containerRect.bottom;
      const left = elementRect.left < containerRect.left;
      const right = elementRect.right > containerRect.right;
      return top || bottom || left || right;
    } catch (e) {
      return false;
    }
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

  const elements = [];

  const walk = (element, isRoot = false) => {
    let node;

    if (!element) {
      return;
    }

    if (isVisible(element) && !isOverflowHidden(element) && !isRoot) {
      elements.push(element);
    }

    for (node = element.firstChild; node; node = node.nextSibling) {
      if (node.nodeType === 1) {
        walk(node);
      }
    }
  };

  const getRootElement = rootSelector => {
    const roots = Array.from(
      // Replace all > * from the selector
      // We want the parent and not all the children
      window.document.querySelectorAll(
        rootSelector.replace(/(\s+)?>(\s+)?\*/g, '')
      )
    );

    if (roots.length === 1) {
      return roots[0];
    }

    return roots.filter(a => {
      return roots.some(b => b.contains(a) && a !== b);
    })[0];
  };

  const root = getRootElement(selector);

  if (!root) {
    throw new Error('No visible elements found');
  }

  walk(root, true);

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
