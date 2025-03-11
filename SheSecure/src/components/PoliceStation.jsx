import React, { useState, useEffect, useCallback } from 'react';
import getLocation from '../utils/Location';
import { GoogleMap, Marker, useLoadScript, InfoWindow } from '@react-google-maps/api';
import { googleMapAPIDCP } from '../config/config';
import icon1 from '../assets/location1.png'

const PoliceStation = () => {
  const [policeStations, setPoliceStations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);
  const [showPlaceButton, setShowPlaceButton] =useState(true);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: googleMapAPIDCP,
  });

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const location = await getLocation();
        setLatitude(location.lat);
        setLongitude(location.lng);
        fetchNearestPoliceStations(location.lat, location.lng);
      } catch (err) {
        setError(err.message);
        console.error('Error getting location:', err);
      }
    };

    fetchLocation();
  }, []);

  const fetchNearestPoliceStations = async (lat, lng) => {
    setLoading(true);
    setError(null);

    try {
      const apiKey = googleMapAPIDCP;
      const url = `https://places.googleapis.com/v1/places:searchNearby`;

      const requestBody = {
        includedTypes: ['police'],
        locationRestriction: {
          circle: {
            center: {
              latitude: lat,
              longitude: lng,
            },
            radius: 5000,
          },
        },
      };

      const jsonBody = JSON.stringify(requestBody);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location.latitude,places.location.longitude',
        },
        body: jsonBody,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);
      if (data && data.places && data.places.length > 0) {
        setPoliceStations(data.places);
      } else {
        setPoliceStations(null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // const placeIcon1 = {
  //   url: {icon1},
  //   scaledSize: new window.google.maps.Size(32, 32),
  // };

  const renderMarkers = useCallback(() => {
    return policeStations?.map((station, index) => (
        <Marker
        key={index}
        position={{
            lat: station.location.latitude,
            lng: station.location.longitude,
        }}
        onClick={() => setSelectedStation(station)}
        />
    ));
  }, [policeStations]);

  if (!isLoaded) return <p>Loading Map...</p>;

  return (
    <div>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {policeStations && (
        <div className='flex h-screen'>
          <GoogleMap
            center={{ lat: latitude, lng: longitude }}
            zoom={12}
            mapContainerStyle={{ width: `${showPlaceButton?'75%':'100%'}`, height: '100%' }}
          >
            {renderMarkers()}

            {selectedStation && (
              <InfoWindow
                position={{
                  lat: selectedStation.location.latitude,
                  lng: selectedStation.location.longitude,
                }}
                onCloseClick={() => setSelectedStation(null)}
              >
                <div>
                  <p className='font-bold'>{selectedStation.displayName?.text || 'Police Station'}</p>
                  {/* <p>{selectedStation.formattedAddress || 'Address not available'}</p> */}
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
          <button className='fixed top-0 right-0 w-[3%] mt-0.5 p-1 bg-blue-600 text-white hover:opacity-50 cursor-pointer'
          onClick={()=>setShowPlaceButton(!showPlaceButton)}
          >
            {showPlaceButton?'>>':'<<'}</button>
          <div className={`${showPlaceButton?'':'hidden'} w-[25%] h-screen`}>
            <div className='border-white border-2'>
              <p className='bg-green-500 text-white text-2xl text-center w-[90%]'>Nearest Police Station</p>
            </div>
            <div className='w-full bg-gray-300 h-[95%] overflow-x-hidden'>
              {policeStations?.map((station, index) => (
                <div className='p-1 border-white border-2'>
                  <p className='font-bold'>{station.displayName.text || 'Police Station'}</p>
                  <p>{station.formattedAddress || 'Address'}</p>
                  <p>{station.location.latitude} {station.location.longitude}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!loading && !policeStations && !error && latitude && longitude && (
        <p>Loading police stations...</p>
      )}
    </div>
  );
};

export default PoliceStation;
