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
      <div
        style={{
          position: 'relative',
          top: '-20px',
          left: '25px',
          width: '50px',
          height: '50px',
          backgroundColor: 'yellow',
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
          overflow: 'hidden',
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

      <div
        style={{
          position: 'fixed',
          top: 150,
          left: 20,
          width: 100,
          height: 100,
          backgroundColor: 'red',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 75,
            left: 75,
            width: 50,
            height: 50,
            backgroundColor: 'orange',
          }}
        ></div>
      </div>
    </div>
  </div>
);

export const SliderWithNestedOverflow = () => (
  <div>
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 300,
        height: 80,
        overflow: 'hidden',
        backgroundColor: 'blue',
        padding: 10,
      }}
    >
      <div
        style={{
          overflowX: 'scroll',
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'nowrap',
            }}
          >
            {[...new Array(10)].map((_, index) => (
              <div
                className={`slide_${index + 1}`}
                style={{
                  flexShrink: 0,
                  width: 80,
                  height: 80,
                  backgroundColor: 'yellow',
                  marginRight: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                  display: 'flex',
                }}
              >
                {index + 1}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const NestedOverflowHidden = () => (
  <div
    style={{
      overflow: 'hidden',
      width: 200,
      height: 200,
      backgroundColor: 'blue',
    }}
  >
    The other box should not be visible
    <div
      style={{
        position: 'relative',
        top: 0,
        left: 300,
        width: 200,
        height: 200,
        overflow: 'hidden',
      }}
    >
      <div style={{ backgroundColor: 'yellow', width: 100, height: 100 }}>
        Hidden box
      </div>
    </div>
  </div>
);
