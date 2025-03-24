import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import getLocation from './Location';
import { api } from '../config/config';

const useSOSSystem = () => {
  const [reportId, setReportId] = useState(null);
  const [sosLink, setSosLink] = useState(null);
  const [errorSOS, setErrorSOS] = useState(null);
  const [isSOSActive, setIsSOSActive] = useState(false);
  const { latitude, longitude, error: locationError } = getLocation();

  const startSOS = async () => {
    try {
      const newReportId = uuidv4();
      setReportId(newReportId);
      setIsSOSActive(true);

      const response = await fetch(api+'/sos/start-sos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reportId: newReportId }),
      });

      if (!response.ok) {
        throw new Error('Failed to start SOS');
      }

      setSosLink(`http://localhost:5173/emergencyMap/?reportId=${newReportId}`);

      if (latitude && longitude) {
        sendLocation(newReportId, latitude, longitude);
      }
    } catch (err) {
      setErrorSOS(err.message);
      setIsSOSActive(false);
      console.error('SOS error:', err);
    }
  };

  const stopSOS = async () => {
    try {
      setIsSOSActive(false);
      setSosLink(null);
      setReportId(null);
    } catch (err) {
      setErrorSOS(err.message);
      console.error('Error stopping SOS', err);
    }
  };

  const sendLocation = async (currentReportId, lat, lon) => {
    try {
      await fetch(api+'/sos/update-location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportId: currentReportId,
          latitude: lat,
          longitude: lon,
        }),
      });
    } catch (err) {
      setErrorSOS(err.message);
      console.error('Location update error:', err);
    }
  };

  useEffect(() => {
    if (isSOSActive && latitude && longitude) {
      sendLocation(reportId, latitude, longitude);
    }
  }, [isSOSActive, latitude, longitude, reportId]);

  return {
    reportId,
    sosLink,
    errorSOS,
    isSOSActive,
    locationError,
    startSOS,
    stopSOS,
  };
};

export default useSOSSystem;