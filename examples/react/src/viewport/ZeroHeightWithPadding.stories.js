import React from 'react';

export default {
  title: 'Zero height',
};

export const ZeroHeightWithPadding = () => (
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
ZeroHeightWithPadding.storyName = 'with padding';
