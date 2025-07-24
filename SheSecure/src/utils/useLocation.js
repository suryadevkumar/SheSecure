import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import searchNearby from './SearchNearBy';
import { setLocation, setError } from '../redux/locationSlice';
import { setPoliceStations } from '../redux/policeStationSlice';
import { setHospitals } from '../redux/hospitalSlice';
import { setCrimeReports } from '../redux/crimeSlice';
import calculateDistance from './calculateDistance';
import { sendLocationToBackend } from '../routes/location-routes';
import { crimeReportsNearMe } from '../routes/crime-report-routes';

const useLocationTracking = () => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);
  const lastLocation = useRef({ lat: null, lng: null, startTime: null });
  const watchId = useRef(null);

  return new Promise((resolve) => {
    useEffect(() => {
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'hidden') {
          if (lastLocation.current.lat && lastLocation.current.lng && lastLocation.current.startTime) {
            sendLocationToBackend(
              lastLocation.current.lat,
              lastLocation.current.lng,
              lastLocation.current.startTime,
              new Date(),
              token
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

      let isInitialLocationFetched = false;

      const watchLocation = () => {
        if (navigator.geolocation) {
          watchId.current = navigator.geolocation.watchPosition(
            async (position) => {
              const { latitude: lat, longitude: lng } = position.coords;
              const now = new Date();

              // Send initial location to backend only if lastLocation is null
              if (!lastLocation.current.lat || !lastLocation.current.lng) {
                lastLocation.current = { lat, lng, startTime: now };
                await sendLocationToBackend(lat, lng, now, now, token);

                if (!isInitialLocationFetched) {
                  isInitialLocationFetched = true;
                  resolve(); // Resolve the promise when initial location is fetched
                }
              } else if (lastLocation.current.lat !== lat || lastLocation.current.lng !== lng) {
                await sendLocationToBackend(
                  lastLocation.current.lat,
                  lastLocation.current.lng,
                  lastLocation.current.startTime,
                  now,
                  token
                );
              }

              dispatch(setLocation({ latitude: lat, longitude: lng }));
              lastLocation.current = { lat, lng, startTime: now };

              try {
                const policeStations = await searchNearby(lat, lng, 'police');
                const hospitals = await searchNearby(lat, lng, 'hospital');
                const crimeData = await crimeReportsNearMe(token, lat, lng);
                dispatch(setCrimeReports(crimeData.crimes));

                const processPlaces = (places) =>
                  places
                    .filter((place) => place.location && place.location.latitude && place.location.longitude)
                    .map((place) => ({
                      ...place,
                      distance: calculateDistance(lat, lng, place.location.latitude, place.location.longitude),
                    }))
                    .sort((a, b) => a.distance - b.distance);

                dispatch(setPoliceStations(processPlaces(policeStations)));
                dispatch(setHospitals(processPlaces(hospitals)));
              } catch (error) {
                dispatch(setError(error.message));
                console.error("Error fetching nearby places:", error.message);
              }
            },
            (err) => {
              dispatch(setError(err.message));
              console.error('Error watching location:', err);
              if (!isInitialLocationFetched) {
                isInitialLocationFetched = true;
                resolve();
              }
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0,
            }
          );
        } else {
          dispatch(setError('Geolocation is not supported by this browser.'));
          resolve();
        }
      };

      if (token && user) {
        watchLocation();
      } else {
        resolve();
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
            new Date(),
            token
          );
        }
      };
    }, [dispatch, token, user]);
  });
};

export default useLocationTracking;
