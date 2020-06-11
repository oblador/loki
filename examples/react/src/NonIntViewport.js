import React from 'react';

const NonIntViewport = ({ children }) => (
  <div
    style={{
      width: '100%',
      paddingTop: '17%',
      backgroundColor: '#00f',
    }}
  >
    {children}
  </div>
);

export default NonIntViewport;
