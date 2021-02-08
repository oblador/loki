import React, { useEffect, useState } from 'react';

export const FetchFail = () => {
  const [fetchState, setFetchState] = useState(undefined);
  useEffect(() => {
    setFetchState('LOADING');
    fetch('http://localhost:1234/get')
      .then(res => {
        if (res.ok) {
          setFetchState('COMPLETED');
        } else {
          setFetchState('ERROR');
        }
      })
      .catch(() => {
        setFetchState('ERROR');
      });
  }, []);

  return (
    <div>
      {fetchState === 'LOADING' && <h1>Loading</h1>}
      {fetchState === 'COMPLETED' && <h1>Ok</h1>}
      {fetchState === 'ERROR' && <h1>Error</h1>}
    </div>
  );
};

export default FetchFail;
