import React from 'react';
import isLokiRunning from '@loki/is-loki-running';
import './isLokiRunning.css';

const DisableAnimationsContext = React.createContext(false);

export const withDisabledAnimations = (getStory) => (
  <DisableAnimationsContext.Provider value={isLokiRunning()}>
    {getStory()}
  </DisableAnimationsContext.Provider>
);

const IsLokiRunning = () => {
  const disableAnimations = React.useContext(DisableAnimationsContext);
  const running = isLokiRunning();

  return (
    <div className="is-loki-running">
      <code
        style={{
          background: disableAnimations ? 'green' : 'red',
        }}
      >
        disableAnimations={JSON.stringify(disableAnimations)}
      </code>
      <code style={{ background: running ? 'green' : 'red' }}>
        isLokiRunning={JSON.stringify(running)}
      </code>
      <code className="loki-attribute">*[loki-test]</code>
    </div>
  );
};

export default IsLokiRunning;
