import React from 'react';

const ZeroHeightWithPadding = () => (
  <div
    style={{
      overflow: 'hidden',
      position: 'relative',
      width: '100%',
      height: '0px',
      paddingBottom: '50%',
      backgroundColor: 'green',
    }}
  />
);

export default ZeroHeightWithPadding;
