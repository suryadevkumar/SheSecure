import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { GoogleMap, Marker, useLoadScript, InfoWindow } from '@react-google-maps/api';
import { googleMapAPI } from '../config/config';
import icon1 from '../assets/location1.png';

const PoliceStation = () => {
  const policeStations = useSelector((state) => state.police.policeStations);
  const [selectedStation, setSelectedStation] = useState(null);
  const [showPlaceButton, setShowPlaceButton] = useState(true);
  const [mapCenter, setMapCenter] = useState(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: googleMapAPI,
  });

  const { latitude, longitude, error: locationError } = useSelector((state) => state.location);

  useEffect(() => {
    if (latitude && longitude) {
      setMapCenter({ lat: latitude, lng: longitude });
    }
  }, [latitude, longitude]);

  const renderMarkers = useCallback(() => {
    if (!window.google) return null;

    const placeIcon1 = {
      url: icon1,
      scaledSize: new window.google.maps.Size(32, 32),
      anchor: new window.google.maps.Point(16, 32),
    };

    return policeStations?.map((station, index) => {
      // Ensure the location exists before rendering
      if (!station.location || !station.location.latitude || !station.location.longitude) {
        return null; // Skip rendering this marker
      }

      return (
        <Marker
          key={index}
          position={{
            lat: station.location.latitude,
            lng: station.location.longitude,
          }}
          icon={placeIcon1}
          onClick={() => setSelectedStation(station)}
        />
      );
    });
  }, [policeStations]);

  if (!isLoaded) return <p>Loading Map...</p>;

  return (
    <div className="h-[calc(100vh-5rem)]">
      {policeStations && (
        <div className="flex h-full">
          <div className={`${showPlaceButton ? 'w-[75%]' : 'w-full'} transition-all duration-300`}>
            <GoogleMap
              center={mapCenter}
              zoom={12}
              mapContainerStyle={{ width: '100%', height: '100%' }}
              onClick={() => setSelectedStation(null)}
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
          </div>

          <button
            className="absolute top-[3rem] right-0 w-[3%] mt-0.5 p-1 bg-blue-600 text-white hover:opacity-50 cursor-pointer"
            onClick={() => setShowPlaceButton(!showPlaceButton)}
          >
            {showPlaceButton ? '>>' : '<<'}
          </button>

          <div className={`${showPlaceButton ? 'w-[25%]' : 'hidden'} transition-all duration-300 h-full`}>
            <div className="border-white border-2">
              <p className="bg-green-500 text-white text-2xl text-center w-[90%]">Nearest Police Stations</p>
            </div>
            <div className="w-full bg-gray-300 h-[95%] overflow-x-hidden">
              {policeStations?.map((station, index) => (
                <div className="p-1 border-white border-2" key={index}>
                  <p className="font-bold">{station.displayName.text || 'Police Station'}</p>
                  <p className="text-sm">{station.formattedAddress || 'Address'}</p>
                  <p><b>Distance: </b>{station.distance.toFixed(2)} km</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!policeStations && !locationError && latitude && longitude && (
        <p>Loading police stations...</p>
      )}
      <style>
        {`
          .gm-ui-hover-effect {
            display: none !important;
          }
        `}
      </style>
    </div>
  );
};

export default PoliceStation;
