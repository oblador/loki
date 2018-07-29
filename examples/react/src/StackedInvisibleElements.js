import React from 'react';

const StackedInvisibleElements = () => [
  <div>There should not be other elements</div>,
  <div
    style={{
      visibility: 'hidden',
    }}
  >
    This should not appear in the screenshot
  </div>,
  <div
    style={{
      display: 'none',
    }}
  >
    This should not appear in the screenshot
  </div>,
  <div
    style={{
      opacity: 0,
    }}
  >
    This should not appear in the screenshot
  </div>,
  <div
    style={{
      width: 0,
    }}
  >
    This should not appear in the screenshot
  </div>,
  <div
    style={{
      height: 0,
    }}
  >
    This should not appear in the screenshot
  </div>,
];
export default StackedInvisibleElements;
