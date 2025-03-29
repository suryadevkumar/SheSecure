import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setLocation, setError } from '../redux/locationSlice';
import searchNearby from './SearchNearBy';
import { setPoliceStations } from '../redux/policeStationSlice';
import { api } from '../config/config';

// Haversine formula to calculate distance between two lat/lng points
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  return distance;
};

const useLocationTracking = () => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);
  const lastLocation = useRef({ lat: null, lng: null, startTime: null });
  const watchId = useRef(null);

  const sendLocationToBackend = async (lat, lng, startTime, endTime) => {
    if (!token) return;
    // try {
    //   const response = await fetch(api + '/location/save-userLocation', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       Authorization: `Bearer ${token}`,
    //     },
    //     body: JSON.stringify({
    //       locations: [{
    //         latitude: lat,
    //         longitude: lng,
    //         startTime: startTime,
    //         endTime: endTime,
    //       }],
    //     }),
    //   });

    //   if (!response.ok) {
    //     console.error('Error sending location history to backend', await response.text());
    //   }
    // } catch (err) {
    //   console.error('Failed to send location history:', err);
    // }
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        if (lastLocation.current.lat && lastLocation.current.lng && lastLocation.current.startTime) {
          sendLocationToBackend(
            lastLocation.current.lat,
            lastLocation.current.lng,
            lastLocation.current.startTime,
            new Date()
          );
        }
        if (watchId.current) {
          navigator.geolocation.clearWatch(watchId.current);
        }
      } else {
        watchLocation();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    const watchLocation = () => {
      if (navigator.geolocation) {
        watchId.current = navigator.geolocation.watchPosition(
          async (position) => {
            const { latitude: lat, longitude: lng } = position.coords;
            const now = new Date();

            // Send initial location to backend only if lastLocation is null
            if (!lastLocation.current.lat || !lastLocation.current.lng) {
              lastLocation.current = { lat, lng, startTime: now };
              // Send initial location to the backend
              sendLocationToBackend(lat, lng, now, now);
            } else if (lastLocation.current.lat !== lat || lastLocation.current.lng !== lng) {
              // Send previous location data to the backend if location has changed
              await sendLocationToBackend(
                lastLocation.current.lat,
                lastLocation.current.lng,
                lastLocation.current.startTime,
                now
              );
            }

            dispatch(setLocation({ latitude: lat, longitude: lng }));

            lastLocation.current = { lat, lng, startTime: now };

            try {
              const places = await searchNearby(lat, lng, 'police');

              const validStations = places.filter(station => station.location && station.location.latitude && station.location.longitude);

              const sortedPoliceStations = validStations
                .map((station) => {
                  const stationLat = station.location.latitude;
                  const stationLng = station.location.longitude;
                  
                  const distance = calculateDistance(
                    lat,
                    lng,
                    stationLat,
                    stationLng
                  );
                  return { ...station, distance };
                })
                .sort((a, b) => a.distance - b.distance);

              dispatch(setPoliceStations(sortedPoliceStations));
            } catch (error) {
              dispatch(setError(error.message));
              console.error("Error fetching police stations:", error.message);
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
      watchLocation();
    }

    return () => {
      if (watchId.current) {
        navigator.geolocation.clearWatch(watchId.current);
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