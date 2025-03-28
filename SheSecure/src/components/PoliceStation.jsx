import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { GoogleMap, Marker, useLoadScript, InfoWindow } from '@react-google-maps/api';
import { googleMapAPI } from '../config/config';
import icon1 from '../assets/location1.png';
import searchNearby from '../utils/SearchNearBy';
import { Header2 } from './Header';
import { Footer } from './Footer';

const PoliceStation = () => {
  const [policeStations, setPoliceStations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);
  const [showPlaceButton, setShowPlaceButton] = useState(true);
  const [mapCenter, setMapCenter] = useState(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: googleMapAPI,
  });

  const { latitude, longitude, error: locationError } = useSelector((state) => state.location);
  console.log(latitude, longitude);

  useEffect(() => {
    if (latitude && longitude) {
      setMapCenter({ lat: latitude, lng: longitude });
      fetchPoliceStations(latitude, longitude);
    }
  }, [latitude, longitude]);

  useEffect(() => {
    if (locationError) {
      setError(locationError);
    }
  }, [locationError]);

  const fetchPoliceStations = async (lat, lng) => {
    setLoading(true);
    setError(null);

    try {
      const places = await searchNearby(lat, lng, 'police');
      setPoliceStations(places);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderMarkers = useCallback(() => {
    if (!window.google) {
      return null;
    }

    const placeIcon1 = {
      url: icon1,
      scaledSize: new window.google.maps.Size(32, 32),
      anchor: new window.google.maps.Point(16, 32),
    };

    return policeStations?.map((station, index) => (
      <Marker
        key={index}
        position={{
          lat: station.location.latitude,
          lng: station.location.longitude,
        }}
        icon={placeIcon1}
        onClick={() => setSelectedStation(station)}
      />
    ));
  }, [policeStations]);

  if (!isLoaded) return <p>Loading Map...</p>;

  return (
    <div className=' h-screen'>
      <Header2/>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {policeStations && (
        <div className="flex flex-grow">
          <GoogleMap
            center={mapCenter}
            zoom={12}
            mapContainerStyle={{ width: `${showPlaceButton ? '75%' : '100%'}`, height: 'calc(100vh - 4rem)' }}
            onClick={() => setSelectedStation(null)} // Reset selectedStation on map click
          >
            {renderMarkers()}

            {selectedStation && (
              <InfoWindow
                key={selectedStation.place_id}
                position={{
                  lat: selectedStation.location.latitude,
                  lng: selectedStation.location.longitude,
                }}
                options={{
                  disableAutoPan: true,
                  pixelOffset: new window.google.maps.Size(0, -30),
                }}
              >
                <div>
                  <p className="font-bold">{selectedStation.displayName?.text || 'Police Station'}</p>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
          <button
            className="fixed top-16 right-0 w-[3%] mt-0.5 p-1 bg-blue-600 text-white hover:opacity-50 cursor-pointer"
            onClick={() => setShowPlaceButton(!showPlaceButton)}
          >
            {showPlaceButton ? '>>' : '<<'}
          </button>
          <div className={`${showPlaceButton ? '' : 'hidden'} w-[25%] h-[calc(100vh-4rem)]`}>
            <div className="border-white border-2">
              <p className="bg-green-500 text-white text-2xl text-center w-[90%]">Nearest Police Stations</p>
            </div>
            <div className="w-full bg-gray-300 h-[95%] overflow-x-hidden">
              {policeStations?.map((station, index) => (
                <div className="p-1 border-white border-2" key={index}>
                  <p className="font-bold">{station.displayName.text || 'Police Station'}</p>
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
      <style>
        {`
          .gm-ui-hover-effect {
            display: none !important;
          }
        `}
      </style>
      <Footer/>
    </div>
  );
};

export default PoliceStation;