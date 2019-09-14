import React from 'react';

const LongElement = () => [
  <div style={{ backgroundColor: 'red', height: 1000 }}>
    Very long div that goes below fold.
  </div>,
  <div>=== End ===</div>,
];

export default LongElement;
