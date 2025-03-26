import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setLocation, setError } from '../redux/locationSlice';
import { api } from '../config/config';

const useLocationTracking = () => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);
  const lastLocation = useRef({ lat: null, lng: null, startTime: null });
  const watchId = useRef(null); // Store watch ID to clear later

  const sendLocationToBackend = async (lat, lng, startTime, endTime) => {
    if (!token || !user) return;
    try {
      const response = await fetch(api + '/location/save-userLocation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user._id,
          locations: [{
            latitude: lat,
            longitude: lng,
            startTime: startTime,
            endTime: endTime,
          }],
        }),
      });

      if (!response.ok) {
        console.error('Error sending location history to backend');
      }
    } catch (err) {
      console.error('Failed to send location history:', err);
    }
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // When tab is hidden, send current location to backend if available
        if (lastLocation.current.lat && lastLocation.current.lng && lastLocation.current.startTime) {
          sendLocationToBackend(
            lastLocation.current.lat,
            lastLocation.current.lng,
            lastLocation.current.startTime,
            new Date()
          );
        }
        if (watchId.current) {
          navigator.geolocation.clearWatch(watchId.current); // Clear the geolocation watch
        }
      } else {
        // When tab becomes visible, reinitialize the geolocation tracking
        watchLocation(); // Resume tracking when the tab becomes visible again
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    const watchLocation = () => {
      if (navigator.geolocation) {
        watchId.current = navigator.geolocation.watchPosition(
          async (position) => {
            const { latitude: lat, longitude: lng } = position.coords;

            // Always update Redux with the current position
            dispatch(setLocation({ latitude: lat, longitude: lng }));

            // Check if the location has changed and update the backend if necessary
            if (
              lastLocation.current.lat === null ||
              lastLocation.current.lng === null ||
              lastLocation.current.lat !== lat ||
              lastLocation.current.lng !== lng
            ) {
              const now = new Date();
              if (lastLocation.current.lat && lastLocation.current.lng && lastLocation.current.startTime) {
                await sendLocationToBackend(
                  lastLocation.current.lat,
                  lastLocation.current.lng,
                  lastLocation.current.startTime,
                  now
                );
              }

              // Update last known location
              lastLocation.current = { lat, lng, startTime: now };
            }
          },
          (err) => {
            dispatch(setError(err.message));
            console.error('Error watching location:', err);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );
      } else {
        dispatch(setError('Geolocation is not supported by this browser.'));
      }
    };

    if (token && user) {
      watchLocation(); // Start location tracking
    }

    // Clean up on component unmount
    return () => {
      if (watchId.current) {
        navigator.geolocation.clearWatch(watchId.current); // Clear watch when component unmounts
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (lastLocation.current.lat && lastLocation.current.lng && lastLocation.current.startTime) {
        sendLocationToBackend(
          lastLocation.current.lat,
          lastLocation.current.lng,
          lastLocation.current.startTime,
          new Date()
        );
      }
    };
  }, [dispatch, token, user]);

  return null;
};

export default useLocationTracking;