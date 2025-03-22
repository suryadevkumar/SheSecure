import React from 'react';
import useSOSSystem from '../utils/sosSystem';

const SOSButton = () => {
  const { startSOS, stopSOS, sosLink, errorSOS, locationError, isSOSActive } = useSOSSystem();

  return (
    <div>
      <button onClick={isSOSActive ? stopSOS : startSOS}>
        {isSOSActive ? 'Stop SOS' : 'Start SOS'}
      </button>
      {sosLink && (
        <p>
          SOS Link: <a href={sosLink} target="_blank" rel="noopener noreferrer">{sosLink}</a>
        </p>
      )}
      {errorSOS && <p>Error: {errorSOS}</p>}
      {locationError && <p>Location Error: {locationError}</p>}
    </div>
  );
};

export default SOSButton;