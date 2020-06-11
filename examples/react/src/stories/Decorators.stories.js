import React from 'react';

export default {
  title: 'Decorators',
};

export const OverflowWithOneElement = () => (
  <div
    className="story-decorator"
    style={{
      overflow: 'hidden',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    }}
  >
    <div style={{ backgroundColor: 'red', height: 1000 }}>
      Very long div that goes below fold.
    </div>
  </div>
);

export const OverflowWithSeveralElements = () => (
  <div
    className="story-decorator"
    style={{
      overflow: 'hidden',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    }}
  >
    <div style={{ backgroundColor: 'red', height: 500 }}>Very long div</div>
    <div style={{ backgroundColor: 'yellow', height: 500 }}>Very long div</div>
  </div>
);
