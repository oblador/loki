const getSelectorBoxSize = (window, selector) => {
  function hasOverflow(element) {
    const overflowValues = ['auto', 'hidden', 'scroll'];
    const style = window.getComputedStyle(element);

    if (
      overflowValues.includes(style.overflowY) ||
      overflowValues.includes(style.overflowX) ||
      overflowValues.includes(style.overflow)
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
    { hasParentFixedPosition, hasParentOverflowHidden, parentNotVisible }
  ) {
    const isElementOutOfBounds = () => {
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

    // Element is not fixed and parent is hidden by overflow
    // So this should not be visible
    if (parentNotVisible) {
      return true;
    }

    // Parent has fixed and overflow hidden
    // check if its out of bounds
    if (
      hasParentFixedPosition &&
      hasParentOverflowHidden &&
      hasParentFixedPosition === hasParentOverflowHidden
    ) {
      return isElementOutOfBounds();
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
      return isElementOutOfBounds();
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
      parentNotVisible = false,
      root,
    }
  ) {
    let node;

    if (!element) {
      return;
    }

    const ignoreIsElementHiddenByOverflow =
      element.parentElement === root && hasOverflow(root);
    const elementHiddenByOverflow = ignoreIsElementHiddenByOverflow
      ? false
      : isElementHiddenByOverflow(element, {
          hasParentFixedPosition,
          hasParentOverflowHidden,
          parentNotVisible,
        });

    if (isVisible(element) && !isRoot && !elementHiddenByOverflow) {
      elements.push(element);
    }

    for (node = element.firstChild; node; node = node.nextSibling) {
      if (node.nodeType === 1) {
        walk(node, {
          root,
          isRoot: false,
          parentNotVisible: elementHiddenByOverflow,
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
      Array.from(window.document.querySelectorAll(rootSelector)).map(
        (element) => element.parentElement
      )
    );

    if (roots.length === 1) {
      return roots[0];
    }

    // Find the deepest node
    return roots.reduce((root, node) => {
      if (!root) {
        return node;
      }

      if (root.contains(node) && root !== node) {
        return node;
      }

      return root;
    }, null);
  }

  const root = getRootElement(selector);

  if (!root) {
    throw new Error('No visible elements found');
  }

  walk(root, { isRoot: true, root });

  if (elements.length === 0) {
    throw new Error('No visible elements found');
  }

  const getBoundingClientRect = (element) => element.getBoundingClientRect();

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
