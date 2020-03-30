import React from 'react';

export default {
  title: 'Positions',
};

export const Absolute = () => (
  <div>
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 100,
        height: 100,
        backgroundColor: 'blue',
      }}
    >
      Position Absolute
    </div>
  </div>
);

export const RelativeWrapper = () => (
  <div
    style={{
      position: 'relative',
      height: 0,
      width: 0,
    }}
  >
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 100,
        height: 100,
        backgroundColor: 'blue',
      }}
    >
      Position Absolute
    </div>
    <div
      style={{
        position: 'fixed',
        top: 50,
        left: 150,
        width: 100,
        height: 100,
        backgroundColor: 'green',
      }}
    >
      Position Fixed
    </div>
  </div>
);

export const Fixed = () => (
  <div>
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 100,
        height: 100,
        backgroundColor: 'green',
      }}
    >
      Position Fixed
    </div>
  </div>
);

export const Nested = () => (
  <div>
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 100,
        height: 100,
        backgroundColor: 'blue',
      }}
    >
      Position Absolute
      <div
        style={{
          position: 'fixed',
          top: 50,
          left: 150,
          width: 100,
          height: 100,
          backgroundColor: 'green',
        }}
      >
        Position Fixed
      </div>
    </div>
  </div>
);

export const OverflowHiddenRelative = () => (
  <div>
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 100,
        height: 100,
        overflow: 'hidden',
        backgroundColor: 'blue',
      }}
    >
      <div
        style={{
          position: 'relative',
          top: 50,
          left: 150,
          width: 100,
          height: 100,
          backgroundColor: 'green',
        }}
      ></div>
    </div>
  </div>
);

export const OverflowHiddenFixed = () => (
  <div>
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 100,
        height: 100,
        overflow: 'hidden',
        backgroundColor: 'blue',
      }}
    >
      <div
        style={{
          position: 'fixed',
          top: 50,
          left: 150,
          width: 100,
          height: 100,
          backgroundColor: 'green',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 75,
            left: 75,
            width: 50,
            height: 50,
            backgroundColor: 'yellow',
          }}
        ></div>
      </div>
    </div>
  </div>
);
