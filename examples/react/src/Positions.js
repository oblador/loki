import React from 'react';

const Positions = () => (
  <div>
    <div
      style={{
        position: 'absolute',
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
        left: 200,
        width: 100,
        height: 100,
        backgroundColor: 'green',
      }}
    >
      Position Fixed
    </div>
  </div>
);

export default Positions;
