const getSelectorBoxSize = (window, selector) => {
  function hasOverflow(element) {
    const style = window.getComputedStyle(element);

    if (
      ['auto', 'hidden', 'scroll'].includes(style.overflowY) ||
      ['auto', 'hidden', 'scroll'].includes(style.overflowX) ||
      ['auto', 'hidden', 'scroll'].includes(style.overflow)
    ) {
      return true;
    }

    return false;
  }

  function hasFixedPosition(element) {
    const style = window.getComputedStyle(element);
    return style.position === 'fixed';
  }

  function isElementHiddenByOverflow(
    element,
    { hasParentFixedPosition, hasParentOverflowHidden }
  ) {
    const checkOutOfBounds = () => {
      try {
        const elementRect = element.getBoundingClientRect();
        const containerRect = hasParentOverflowHidden.getBoundingClientRect();
        const top = elementRect.top < containerRect.top;
        const bottom = elementRect.bottom > containerRect.bottom;
        const left = elementRect.left < containerRect.left;
        const right = elementRect.right > containerRect.right;
        return top || bottom || left || right;
      } catch (e) {
        return false;
      }
    };

    // Has fixed so it should always be visible
    if (hasFixedPosition(element)) {
      return false;
    }

    // Parent has fixed and overflow hidden
    // check if its out of bounds
    if (
      hasParentFixedPosition &&
      hasParentOverflowHidden &&
      hasParentFixedPosition === hasParentOverflowHidden
    ) {
      return checkOutOfBounds();
    }

    // If we have a fixed element deeper then overflow
    // We know the element is visible
    if (
      hasParentFixedPosition &&
      hasParentOverflowHidden &&
      hasParentOverflowHidden !== hasParentFixedPosition &&
      hasParentOverflowHidden.contains(hasParentFixedPosition)
    ) {
      return false;
    }

    // Parent has overflow so we need to check if this element is out of bounds
    if (hasParentOverflowHidden) {
      return checkOutOfBounds();
    }

    return false;
  }

  function isVisible(element) {
    const style = window.getComputedStyle(element);
    return !(
      style.visibility === 'hidden' ||
      style.display === 'none' ||
      style.opacity === '0' ||
      ((style.width === '0px' || style.height === '0px') &&
        style.padding === '0px')
    );
  }

  const elements = [];

  function walk(
    element,
    {
      isRoot = false,
      hasParentOverflowHidden = null,
      hasParentFixedPosition = null,
    }
  ) {
    let node;

    if (!element) {
      return;
    }

    if (
      isVisible(element) &&
      !isRoot &&
      !isElementHiddenByOverflow(element, {
        hasParentFixedPosition,
        hasParentOverflowHidden,
      })
    ) {
      elements.push(element);
    }

    for (node = element.firstChild; node; node = node.nextSibling) {
      if (node.nodeType === 1) {
        walk(node, {
          isRoot: false,
          hasParentFixedPosition: hasFixedPosition(element)
            ? element
            : hasParentFixedPosition,
          hasParentOverflowHidden: hasOverflow(element)
            ? element
            : hasParentOverflowHidden,
        });
      }
    }
  }

  function getRootElement(rootSelector) {
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
  }

  const root = getRootElement(selector);

  if (!root) {
    throw new Error('No visible elements found');
  }

  walk(root, { isRoot: true });

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
