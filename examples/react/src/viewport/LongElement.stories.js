import React from 'react';

export default {
  title: 'Long Element',
};

export const LongElement = () => [
  <div style={{ backgroundColor: 'red', height: 1000 }}>
    Very long div that goes below fold.
  </div>,
  <div>=== End ===</div>,
];
LongElement.storyName = 'default';

export const NonIntViewport = () => (
  <div
    style={{
      width: '100%',
      paddingTop: '17%',
      backgroundColor: '#00f',
    }}
  >
    <LongElement />
  </div>
);
NonIntViewport.storyName = 'non-integer Viewport';
