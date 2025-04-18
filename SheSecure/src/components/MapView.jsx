import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { GoogleMap, Marker, useLoadScript, InfoWindow, DirectionsRenderer, Circle } from '@react-google-maps/api';
import { googleMapAPI } from '../config/config';
import icon1 from '../assets/policeIcon.png';
import icon2 from '../assets/hospitalIcon.png';
import icon3 from '../assets/liveLocation.png';
import crimeIcon from '../assets/location1.png';
import { setPathDistance } from '../redux/distanceSlice';
import calculateDistance from "../utils/calculateDistance";
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa";

const MapView = () => {
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [showPlaceButton, setShowPlaceButton] = useState(true);
  const [mapCenter, setMapCenter] = useState(null);
  const [showPoliceStations, setShowPoliceStations] = useState(true);
  const [showHospitals, setShowHospitals] = useState(true);
  const [showCrimes, setShowCrimes] = useState(false);
  const [directions, setDirections] = useState(null);
  const [selectedListPlace, setSelectedListPlace] = useState(null);
  const [selectedCrime, setSelectedCrime] = useState(null);
  const [rippleRadius, setRippleRadius] = useState(50);
  const [rippleColor, setRippleColor] = useState("#00FF00");
  const [safetyScore, setSafetyScore] = useState(100);
  
  const mapRef = useRef(null);
  const dispatch = useDispatch();
  
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: googleMapAPI,
    libraries: ['places', 'directions'],
  });
  
  const policeStations = useSelector((state) => state.police.policeStations);
  const hospitals = useSelector((state) => state.hospital.hospitals);
  const crimesData = useSelector((state) => state.crime.crimeReports);
  const { latitude, longitude, error: locationError } = useSelector((state) => state.location);

  const liveLocation = [{
    displayName: {text: 'Your Location', languageCode: 'en'},
    location: {latitude: latitude, longitude: longitude}
  }];

  // Animate the ripple effect
  useEffect(() => {
    if (showCrimes) {
      const interval = setInterval(() => {
        setRippleRadius((prev) => (prev >= 200 ? 50 : prev + 5));
      }, 100);
      return () => clearInterval(interval);
    }
  }, [showCrimes]);
  
  useEffect(() => {
    if (latitude && longitude) {
      setMapCenter({ lat: latitude, lng: longitude });
      if (crimesData && showCrimes) {
        calculateSafetyScore(crimesData);
      }
    }
  }, [latitude, longitude, crimesData, showCrimes]);

  const calculateSafetyScore = (crimes) => {
    if (!latitude || !longitude) return;
    
    const nearbyCrimes = crimes.filter(crime => {
      const distance = calculateDistance(
        latitude,
        longitude,
        crime.location.latitude,
        crime.location.longitude
      );
      return distance <= 2;
    });
    
    const newScore = Math.max(0, 100 - (nearbyCrimes.length * 10));
    setSafetyScore(newScore);
    setRippleColor(nearbyCrimes.length > 0 ? "#FF0000" : "#00FF00");
  };

  const calculatePathDistance = async (destination) => {
    if (!window.google || !latitude || !longitude) return null;

    const directionsService = new window.google.maps.DirectionsService();
    
    try {
      const results = await directionsService.route({
        origin: { lat: latitude, lng: longitude },
        destination: { lat: destination.location.latitude, lng: destination.location.longitude },
        travelMode: window.google.maps.TravelMode.DRIVING
      });

      const distance = results.routes[0].legs[0].distance.value / 1000;
      dispatch(setPathDistance(distance.toFixed(2)));
      return results;
    } catch (error) {
      console.error("Error calculating directions:", error);
      return null;
    }
  };

  // Effect to update path when live location changes
  useEffect(() => {
    if (selectedListPlace && latitude && longitude) {
      const updatePath = async () => {
        const results = await calculatePathDistance(selectedListPlace.place);
        if (results) {
          setDirections(results);
          
          // Re-center map if needed
          if (mapRef.current) {
            const bounds = new window.google.maps.LatLngBounds();
            bounds.extend(new window.google.maps.LatLng(latitude, longitude));
            bounds.extend(new window.google.maps.LatLng(
              selectedListPlace.place.location.latitude, 
              selectedListPlace.place.location.longitude
            ));
            mapRef.current.fitBounds(bounds);
          }
        }
      };
      
      updatePath();
    }
  }, [latitude, longitude, selectedListPlace]);

  const handleListClick = async (place, placeType, index) => {
    // If clicking the same place again, collapse it
    if (selectedListPlace?.index === index && selectedListPlace?.type === placeType) {
      setSelectedListPlace(null);
      setDirections(null);
      dispatch(setPathDistance(null));
    } else {
      const results = await calculatePathDistance(place);
      if (results) {
        setSelectedListPlace({ place, type: placeType, index });
        setDirections(results);
        
        // Center map on the selected place
        if (mapRef.current) {
          const bounds = new window.google.maps.LatLngBounds();
          bounds.extend(new window.google.maps.LatLng(latitude, longitude));
          bounds.extend(new window.google.maps.LatLng(
            place.location.latitude, 
            place.location.longitude
          ));
          mapRef.current.fitBounds(bounds);
        }
      }
    }
  };

  const handleCrimeClick = (crime) => {
    setSelectedCrime(crime);
    setSelectedMarker({
      displayName: { text: crime.typeOfCrime },
      location: {
        latitude: crime.location.latitude,
        longitude: crime.location.longitude,
      },
    });
  };

  const handleSupport = (isSupported) => {
    // API call to update crime report would go here
    console.log(`Crime ${selectedCrime._id} ${isSupported ? 'supported' : 'unsupported'}`);
    setSelectedCrime(null);
    setSelectedMarker(null);
  };

  const renderMarkers = useCallback((places, icon, show) => {
    if (!window.google || !show) return null;

    const placeIcon = {
      url: icon,
      scaledSize: new window.google.maps.Size(32, 32),
      anchor: new window.google.maps.Point(16, 32),
    };

    return places?.map((place, index) => {
      if (!place.location?.latitude || !place.location?.longitude) return null;

      const shouldShow = !selectedListPlace || 
                       (selectedListPlace.place === place) || 
                       (place.displayName?.text === 'Your Location');

      if (!shouldShow) return null;

      return (
        <Marker
          key={`${place.displayName?.text}-${index}`}
          position={{
            lat: place.location.latitude,
            lng: place.location.longitude,
          }}
          icon={placeIcon}
          onClick={() => setSelectedMarker(place)}
        />
      );
    });
  }, [selectedListPlace]);

  const sortByDistance = (places) => {
    if (!latitude || !longitude || !places) return places;
    return [...places].sort((a, b) => {
      const distA = a.distance || 0;
      const distB = b.distance || 0;
      return distA - distB;
    });
  };

  if (!isLoaded) return <p>Loading Map...</p>;

  const sortedPoliceStations = sortByDistance(policeStations);
  const sortedHospitals = sortByDistance(hospitals);

  return (
    <div className="h-[calc(100vh-5rem)]">
      {(policeStations || hospitals) && (
        <div className="flex h-full">
          <div className={`${showPlaceButton ? 'w-[75%]' : 'w-full'} transition-all duration-300`}>
            <GoogleMap
              center={mapCenter}
              zoom={12}
              mapContainerStyle={{ width: '100%', height: '100%' }}
              onClick={() => {
                setSelectedMarker(null);
                setSelectedCrime(null);
              }}
              onLoad={(map) => mapRef.current = map}
            >
              {renderMarkers(sortedPoliceStations, icon1, showPoliceStations)}
              {renderMarkers(sortedHospitals, icon2, showHospitals)}
              {renderMarkers(liveLocation, icon3, true)}

              {/* Safety ripple circle - only show when crimes are enabled */}
              {mapCenter && showCrimes && (
                <Circle
                  center={mapCenter}
                  radius={rippleRadius * 10}
                  options={{
                    strokeColor: rippleColor,
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    fillColor: rippleColor,
                    fillOpacity: 0.2,
                    clickable: false,
                  }}
                />
              )}
              
              {/* Crime markers with custom icon */}
              {showCrimes && crimesData && crimesData.map((crime) => (
                <Marker
                  key={crime._id}
                  position={{
                    lat: crime.location.latitude,
                    lng: crime.location.longitude,
                  }}
                  icon={{
                    url: crimeIcon,
                    scaledSize: new window.google.maps.Size(32, 32),
                  }}
                  onClick={() => handleCrimeClick(crime)}
                />
              ))}

              {/* Info window for selected crime */}
              {selectedCrime && (
                <InfoWindow
                  position={{
                    lat: selectedCrime.location.latitude,
                    lng: selectedCrime.location.longitude,
                  }}
                  onCloseClick={() => {
                    setSelectedCrime(null);
                    setSelectedMarker(null);
                  }}
                >
                  <div className="max-w-xs">
                    <h3 className="font-bold text-red-600">
                      {selectedCrime.typeOfCrime}
                    </h3>
                    <p className="text-sm text-gray-700 mt-1">
                      {selectedCrime.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(selectedCrime.createdAt).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Distance: {calculateDistance(
                        latitude,
                        longitude,
                        selectedCrime.location.latitude,
                        selectedCrime.location.longitude
                      ).toFixed(2)} km away
                    </p>
                    
                    {selectedCrime.crimePhotos?.length > 0 && (
                      <div className="mt-2">
                        <img 
                          src={selectedCrime.crimePhotos[0]} 
                          alt="Crime scene" 
                          className="w-full h-auto rounded"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    
                    <div className="flex justify-between mt-3">
                      <button
                        onClick={() => handleSupport(true)}
                        className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200 transition-colors"
                      >
                        <FaThumbsUp /> Support
                      </button>
                      <button
                        onClick={() => handleSupport(false)}
                        className="flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 transition-colors"
                      >
                        <FaThumbsDown /> Unsupport
                      </button>
                    </div>
                  </div>
                </InfoWindow>
              )}

              {selectedMarker && !selectedCrime && (
                <InfoWindow
                  position={{
                    lat: selectedMarker.location.latitude,
                    lng: selectedMarker.location.longitude,
                  }}
                  options={{
                    disableAutoPan: true,
                    pixelOffset: new window.google.maps.Size(0, -30),
                  }}
                  onCloseClick={() => setSelectedMarker(null)}
                >
                  <div>
                    <p className="font-bold">{selectedMarker.displayName?.text || 'Location'}</p>
                  </div>
                </InfoWindow>
              )}

              {directions && (
                <DirectionsRenderer
                  directions={directions}
                  options={{
                    suppressMarkers: true,
                    polylineOptions: {
                      strokeColor: "#FF0000",
                      strokeOpacity: 0.8,
                      strokeWeight: 4
                    }
                  }}
                />
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
            <div className="border-white border-2 bg-green-500 p-1">
              <label className="text-white text-md py-1 mx-3 text-center w-[90%]">
                <input 
                  type="checkbox" 
                  className="mr-2"
                  checked={showPoliceStations}
                  onChange={() => setShowPoliceStations(!showPoliceStations)}
                />
                <b>Police Station</b>
              </label>
              <label className="text-white text-md py-1 mx-3 text-center w-[90%]">
                <input 
                  type="checkbox" 
                  className="mr-2"
                  checked={showHospitals}
                  onChange={() => setShowHospitals(!showHospitals)}
                />
                <b>Hospitals</b>
              </label>
              <label className="text-white text-md py-1 mx-3 text-center w-[90%]">
                <input 
                  type="checkbox" 
                  className="mr-2"
                  checked={showCrimes}
                  onChange={() => setShowCrimes(!showCrimes)}
                />
                <b>Crime Reports</b>
              </label>
              
              {/* Display safety score when crime reports are shown */}
              {showCrimes && (
                <div className="text-white text-md py-1 mx-3 text-center w-[90%]">
                  <p className="font-bold">
                    Safety Score: {safetyScore}/100
                  </p>
                  <p className="text-sm">
                    {crimesData && crimesData.length > 0 
                      ? `${crimesData.length} crime${crimesData.length !== 1 ? 's' : ''} reported nearby` 
                      : 'No crimes reported nearby'}
                  </p>
                </div>
              )}
            </div>
            <div className="border-white border-2">
              <p className="bg-green-500 text-white text-xl text-center w-[100%]">Nearest PoliceStation</p>
            </div>
            <div className="w-full bg-blue-200 h-[45%] overflow-x-hidden overflow-y-auto">
              {sortedPoliceStations?.map((place, index) => (
                <div 
                  className={`p-1 border-white border-2 cursor-pointer ${
                    selectedListPlace?.type === 'police' && selectedListPlace?.index === index 
                      ? 'bg-gray-300 shadow-md' 
                      : 'hover:bg-gray-100'
                  }`} 
                  key={`police-${index}`}
                  onClick={() => handleListClick(place, 'police', index)}
                >
                  <p className="font-semibold">{place.displayName.text || 'Location'}</p>
                  {selectedListPlace?.type === 'police' && selectedListPlace?.index === index && (
                    <>
                      <p className="text-sm">{place.formattedAddress || 'Address'}</p>
                      <p><span className='font-semibold'>Path Distance: </span>{(directions?.routes[0]?.legs[0]?.distance?.value / 1000).toFixed(2)} km</p>
                    </>
                  )}
                </div>
              ))}
            </div>
            <div className="border-white border-2">
              <p className="bg-green-500 text-white text-xl text-center w-[100%]">Nearest Hospitals</p>
            </div>
            <div className="w-full bg-blue-200 h-[45%] overflow-x-hidden overflow-y-auto">
              {sortedHospitals?.map((place, index) => (
                <div 
                  className={`p-1 border-white border-2 cursor-pointer ${
                    selectedListPlace?.type === 'hospital' && selectedListPlace?.index === index 
                      ? 'bg-gray-300 shadow-md' 
                      : 'hover:bg-gray-100'
                  }`} 
                  key={`hospital-${index}`}
                  onClick={() => handleListClick(place, 'hospital', index)}
                >
                  <p className="font-semibold">{place.displayName.text || 'Location'}</p>
                  {selectedListPlace?.type === 'hospital' && selectedListPlace?.index === index && (
                    <>
                      <p className="text-sm">{place.formattedAddress || 'Address'}</p>
                      <p><span className='font-semibold'>Path Distance: </span>{(directions?.routes[0]?.legs[0]?.distance?.value / 1000).toFixed(2)} km</p>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!policeStations && !hospitals && !locationError && latitude && longitude && (
        <p>Loading nearby locations...</p>
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

export default MapView;