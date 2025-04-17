import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  GoogleMap,
  Marker,
  useLoadScript,
  InfoWindow,
  Circle,
} from "@react-google-maps/api";
import { googleMapAPI } from "../config/config";
import icon2 from "../assets/location1.png"; // Added custom icon for crime reports
import icon3 from "../assets/liveLocation.png";
import { Link } from "react-router-dom";
import {
  FaShieldAlt,
  FaUserFriends,
  FaBell,
  FaMapMarkerAlt,
  FaFirstAid,
  FaPhoneAlt,
  FaWalking,
  FaTaxi,
  FaThumbsUp,
  FaThumbsDown,
  FaExternalLinkAlt,
} from "react-icons/fa";
import { MdSecurity, MdLocalPolice, MdLocalHospital } from "react-icons/md";
import calculateDistance from "../utils/calculateDistance";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);
  const [sosActive, setSosActive] = useState(false);
  const [safetyScore, setSafetyScore] = useState(100);
  const [crimes, setCrimes] = useState([]);
  const [selectedCrime, setSelectedCrime] = useState(null);
  const [rippleRadius, setRippleRadius] = useState(50);
  const [rippleColor, setRippleColor] = useState("#00FF00");
  
  // Redux data for location, crime, police stations and hospitals
  const { latitude, longitude } = useSelector((state) => state.location);
  const crimesData = useSelector((state) => state.crime.crimeReports);
  const policeStations = useSelector((state) => state.police.policeStations);
  const hospitals = useSelector((state) => state.hospital.hospitals);
  
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: googleMapAPI,
  });
  
  const mapRef = useRef(null);
  
  const liveLocation = [
    {
      displayName: { text: "Your Location", languageCode: "en" },
      location: { latitude: latitude, longitude: longitude },
    },
  ];
  
  // Animate the ripple effect
  useEffect(() => {
    const interval = setInterval(() => {
      setRippleRadius((prev) => (prev >= 200 ? 50 : prev + 5));
    }, 100);
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    if (latitude && longitude) {
      setMapCenter({ lat: latitude, lng: longitude });
    }
    if(crimesData){
      setCrimes(crimesData);
      calculateSafetyScore(crimes || []);
    }
  }, [latitude, longitude, crimesData]);

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

  const renderMarkers = useCallback((places, icon) => {
    if (!window.google) return null;

    const placeIcon = {
      url: icon,
      scaledSize: new window.google.maps.Size(32, 32),
      anchor: new window.google.maps.Point(16, 32),
    };

    return places?.map((place, index) => {
      if (!place.location?.latitude || !place.location?.longitude) return null;

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
  }, []);

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

  const handleSOS = () => {
    setSosActive(true);
    alert("SOS activated! Emergency contacts notified with your location.");
    setTimeout(() => setSosActive(false), 5000);
  };

  const handleServiceClick = (service) => {
    navigate('/map-view', { state: { selectedService: service } });
  };

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-pulse text-lg">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="pt-28 p-4 lg:mb-8 sm:mb-24 md:p-6 space-y-8 max-w-6xl mx-auto">
      <div className="w-full space-y-8">
        {/* Safety Status Banner */}
        <div className={`rounded-2xl p-6 shadow-lg text-white ${
          safetyScore > 70 ? 'bg-gradient-to-r from-green-500 to-teal-600' : 
          safetyScore > 40 ? 'bg-gradient-to-r from-yellow-500 to-orange-600' : 
          'bg-gradient-to-r from-red-500 to-pink-600'
        }`}>
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <FaShieldAlt className="text-yellow-300" /> Safety Status
              </h2>
              <p className="mt-2">
                {safetyScore > 70 ? 'You\'re in a safe area' : 
                 safetyScore > 40 ? 'Be cautious in this area' : 
                 'High risk area - stay alert'}
                {crimes.length > 0 && ` (${crimes.length} crime${crimes.length !== 1 ? 's' : ''} reported nearby)`}
              </p>
            </div>
            <div className="mt-4 md:mt-0 text-center">
              <div className="text-4xl font-bold">{safetyScore}/100</div>
              <div className="text-sm opacity-80">Safety Score</div>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/emergency-contacts"
            className="bg-white p-4 rounded-xl shadow-md flex flex-col items-center justify-center text-center hover:bg-purple-50 transition-colors"
          >
            <div className="bg-purple-100 p-3 rounded-full mb-2">
              <FaUserFriends className="text-purple-600 text-xl" />
            </div>
            <span className="font-medium">Trusted Contacts</span>
          </Link>

          <button
            onClick={handleSOS}
            className={`p-4 rounded-xl shadow-md flex flex-col items-center justify-center text-center transition-colors ${
              sosActive ? "bg-red-600 text-white" : "bg-white hover:bg-red-50"
            }`}
          >
            <div
              className={`p-3 rounded-full mb-2 ${
                sosActive ? "bg-red-700" : "bg-red-100"
              }`}
            >
              <FaBell
                className={`text-xl ${
                  sosActive ? "text-white" : "text-red-600"
                }`}
              />
            </div>
            <span className="font-medium">Emergency SOS</span>
          </button>

          <Link
            to="/safe-routes"
            className="bg-white p-4 rounded-xl shadow-md flex flex-col items-center justify-center text-center hover:bg-blue-50 transition-colors"
          >
            <div className="bg-blue-100 p-3 rounded-full mb-2">
              <FaWalking className="text-blue-600 text-xl" />
            </div>
            <span className="font-medium">Safe Routes</span>
          </Link>

          <Link
            to="/fake-call"
            className="bg-white p-4 rounded-xl shadow-md flex flex-col items-center justify-center text-center hover:bg-green-50 transition-colors"
          >
            <div className="bg-green-100 p-3 rounded-full mb-2">
              <FaPhoneAlt className="text-green-600 text-xl" />
            </div>
            <span className="font-medium">Fake Call</span>
          </Link>
        </div>

        {/* Live Location Map with Safety Features */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-xl font-bold text-purple-900 flex items-center gap-2">
              <FaMapMarkerAlt className="text-red-500" /> Live Location & Safety
            </h2>
            <p className="text-gray-500 text-sm">
              {crimes.length > 0 
                ? `${crimes.length} crime${crimes.length !== 1 ? 's' : ''} reported nearby` 
                : 'No crimes reported nearby'}
            </p>
          </div>

          <div className="w-full h-[400px] relative">
            <GoogleMap
              center={mapCenter}
              zoom={15}
              mapContainerStyle={{ width: "100%", height: "100%" }}
              onClick={() => {
                setSelectedMarker(null);
                setSelectedCrime(null);
              }}
              onLoad={(map) => (mapRef.current = map)}
            >
              {/* User location marker */}
              {renderMarkers(liveLocation, icon3)}
              
              {/* Safety ripple circle */}
              {mapCenter && (
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
              {crimes.map((crime) => (
                <Marker
                  key={crime._id}
                  position={{
                    lat: crime.location.latitude,
                    lng: crime.location.longitude,
                  }}
                  icon={{
                    url: icon2,
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
              
              {/* Info window for user location */}
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
                    <p className="font-bold text-sm">
                      {selectedMarker.displayName?.text || "Location"}
                    </p>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          </div>

          <div className="p-5 bg-gray-50 flex flex-wrap justify-between gap-4">
            <button className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 hover:bg-purple-50 transition-colors">
              <FaTaxi className="text-purple-600" /> Safe Ride
            </button>
            <button className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 hover:bg-blue-50 transition-colors">
              <MdSecurity className="text-blue-600" /> Share Trip
            </button>
            <button className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 hover:bg-green-50 transition-colors">
              <FaFirstAid className="text-green-600" /> First Aid
            </button>
          </div>
        </div>

        {/* Emergency Services Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800">
            Emergency Services Nearby
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Police Stations Card with scrollable list */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-blue-100">
              <div className="bg-blue-600 p-4 text-white flex items-center gap-2">
                <MdLocalPolice className="text-xl" />
                <h3 className="font-bold">Police Stations</h3>
              </div>
              <div className="h-60 overflow-y-auto">
                {policeStations && policeStations.length > 0 ? (
                  policeStations.map((station, index) => (
                    <div 
                      key={index}
                      onClick={() => handleServiceClick(station)}
                      className="flex justify-between items-center p-3 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer border-b border-gray-100"
                    >
                      <div>
                        <h4 className="font-medium">{station.displayName?.text}</h4>
                        <p className="text-sm text-gray-500">
                          {station.distance.toFixed(1)} km away • {station.formattedAddress}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <a
                          href="tel:100"
                          onClick={(e) => e.stopPropagation()}
                          className="bg-blue-100 text-blue-700 p-2 rounded-full hover:bg-blue-200 transition-colors"
                        >
                          <FaPhoneAlt />
                        </a>
                        <button 
                          className="bg-blue-100 text-blue-700 p-2 rounded-full hover:bg-blue-200 transition-colors cursor-pointer"
                        >
                          <FaExternalLinkAlt />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    <p>No police stations found nearby</p>
                  </div>
                )}
              </div>
            </div>

            {/* Hospitals Card with scrollable list */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-green-100">
              <div className="bg-green-600 p-4 text-white flex items-center gap-2">
                <MdLocalHospital className="text-xl" />
                <h3 className="font-bold">Hospitals</h3>
              </div>
              <div className="h-60 overflow-y-auto">
                {hospitals && hospitals.length > 0 ? (
                  hospitals.map((hospital, index) => (
                    <div 
                      key={index}
                      onClick={() => handleServiceClick(hospital)}
                      className="flex justify-between items-center p-3 hover:bg-green-50 rounded-lg transition-colors cursor-pointer border-b border-gray-100"
                    >
                      <div>
                        <h4 className="font-medium">{hospital.displayName?.text}</h4>
                        <p className="text-sm text-gray-500">
                          {hospital.distance.toFixed(1)} km away • {hospital.formattedAddress}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <a
                          href="tel:108"
                          onClick={(e) => e.stopPropagation()}
                          className="bg-green-100 text-green-700 p-2 rounded-full hover:bg-green-200 transition-colors"
                        >
                          <FaPhoneAlt />
                        </a>
                        <button 
                          className="bg-green-100 text-green-700 p-2 rounded-full hover:bg-green-200 transition-colors cursor-pointer"
                        >
                          <FaExternalLinkAlt />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    <p>No hospitals found nearby</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Safety Tips Section */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-xl font-bold text-yellow-800 mb-3">
            Safety Tips
          </h2>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="bg-yellow-100 text-yellow-800 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                1
              </div>
              <p className="text-gray-700">
                Share your live location with trusted contacts when traveling
                alone
              </p>
            </div>
            <div className="flex gap-3">
              <div className="bg-yellow-100 text-yellow-800 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                2
              </div>
              <p className="text-gray-700">
                Use well-lit, populated routes at night
              </p>
            </div>
            <div className="flex gap-3">
              <div className="bg-yellow-100 text-yellow-800 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                3
              </div>
              <p className="text-gray-700">
                Keep emergency numbers saved in your phone
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;