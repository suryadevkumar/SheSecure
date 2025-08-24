import { useState, useEffect, useCallback, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  GoogleMap,
  Marker,
  useLoadScript,
  InfoWindow,
  DirectionsRenderer,
  Circle,
} from "@react-google-maps/api";
import { googleMapAPI } from "../config/config";
import icon1 from "../assets/policeIcon.png";
import icon2 from "../assets/hospitalIcon.png";
import icon3 from "../assets/liveLocation.png";
import crimeIcon from "../assets/danger.png";
import pathIcon from "../assets/pathDot.png";
import { setPathDistance } from "../redux/distanceSlice";
import calculateDistance from "../utils/calculateDistance";
import CrimeDetailsModal from "./CrimeDetailsModal";
import { fetchLocationHistory } from "../routes/location-routes";
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa";
import { FiClock, FiCalendar, FiMapPin, FiAlertCircle } from "react-icons/fi";
import { useMediaQuery } from "react-responsive";

// MapView modes
export const MAP_MODES = {
  FULL: "full",
  MINIMAL: "minimal",
  HISTORY: "history",
};

const MAP_LIBRARIES = ["places"];

const MapView = ({ mode = MAP_MODES.FULL }) => {
  const isFullMode = mode === MAP_MODES.FULL;
  const isHistoryMode = mode === MAP_MODES.HISTORY;

  // Responsive breakpoints
  const isMobile = useMediaQuery({ maxWidth: 768 });

  // Common state
  const [mapCenter, setMapCenter] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const mapRef = useRef(null);
  const dispatch = useDispatch();

  // Full/Minimal mode state
  const [showPlaceButton, setShowPlaceButton] = useState(!isMobile);
  const [showPoliceStations, setShowPoliceStations] = useState(isFullMode);
  const [showHospitals, setShowHospitals] = useState(isFullMode);
  const [showCrimes, setShowCrimes] = useState(true);
  const [directions, setDirections] = useState(null);
  const [selectedListPlace, setSelectedListPlace] = useState(null);
  const [selectedCrime, setSelectedCrime] = useState(null);
  const [rippleRadius, setRippleRadius] = useState(50);
  const [rippleColor, setRippleColor] = useState("#00FF00");
  const [safetyScore, setSafetyScore] = useState(100);
  const [showCrimeDetailsModal, setShowCrimeDetailsModal] = useState(false);

  // History mode state
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [timeRange, setTimeRange] = useState({ start: "", end: "" });
  const [showLocationList, setShowLocationList] = useState(!isMobile);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: googleMapAPI,
    libraries: MAP_LIBRARIES,
  });

  // Redux state
  const token = useSelector((state) => state.auth.token);
  const policeStations = useSelector((state) => state.police.policeStations);
  const hospitals = useSelector((state) => state.hospital.hospitals);
  const crimesData = useSelector((state) => state.crime.crimeReports);
  const { latitude, longitude, error: locationError } = useSelector(
    (state) => state.location
  );

  const liveLocation = [
    {
      displayName: { text: "Your Location", languageCode: "en" },
      location: { latitude: latitude, longitude: longitude },
    },
  ];

  // Effects
  useEffect(() => {
    if (latitude && longitude) {
      setMapCenter({ lat: latitude, lng: longitude });

      if (showCrimes && crimesData?.length) {
        calculateSafetyScore(crimesData);
      }
    }
  }, [latitude, longitude, crimesData, showCrimes]);

  useEffect(() => {
    if (!showCrimes) {
      setRippleRadius(50);
      return;
    }

    const interval = setInterval(() => {
      setRippleRadius((prev) => (prev >= 200 ? 50 : prev + 5));
    }, 100);

    return () => clearInterval(interval);
  }, [showCrimes]);

  useEffect(() => {
    if (isHistoryMode) {
      fetchLocationData();
    }
  }, [date, token, isHistoryMode]);

  useEffect(() => {
    if (isHistoryMode) {
      if (!timeRange.start || !timeRange.end) {
        setFilteredLocations(locations);
      } else {
        const startHour = parseInt(timeRange.start);
        const endHour = parseInt(timeRange.end);
        const filtered = locations.filter((loc) => {
          return loc.hour >= startHour && loc.hour <= endHour;
        });
        setFilteredLocations(filtered);
        if (filtered.length > 0) setSelectedMarker(filtered[0]);
      }
    }
  }, [timeRange, locations, isHistoryMode]);

  // Handlers
  const fetchLocationData = async () => {
    if (date && token) {
      setLoading(true);
      try {
        const response = await fetchLocationHistory(date, token);
        if (response.success) {
          const data = response.data.map((loc, i) => ({
            ...loc,
            id: `${loc.latitude}-${loc.longitude}-${i}`,
            hour: new Date(loc.startTime).getHours(),
          }));
          setLocations(data);
          setFilteredLocations(data);
          if (data.length > 0) setSelectedMarker(data[0]);
        } else {
          setLocations([]);
          setFilteredLocations([]);
        }
      } catch (err) {
        setError(err.message);
        setLocations([]);
        setFilteredLocations([]);
      }
      setLoading(false);
    }
  };

  const calculateSafetyScore = (crimes) => {
    if (!latitude || !longitude) return;

    const nearbyCrimes = crimes.filter((crime) => {
      const distance = calculateDistance(
        latitude,
        longitude,
        crime.location.latitude,
        crime.location.longitude
      );
      return distance <= 2;
    });

    const newScore = Math.max(0, 100 - nearbyCrimes.length * 10);
    setSafetyScore(newScore);
    setRippleColor(nearbyCrimes.length > 0 ? "#FF0000" : "#00FF00");
  };

  const calculatePathDistance = async (destination) => {
    if (!window.google || !latitude || !longitude) return null;

    try {
      const results = await new window.google.maps.DirectionsService().route({
        origin: { lat: latitude, lng: longitude },
        destination: {
          lat: destination.location.latitude,
          lng: destination.location.longitude,
        },
        travelMode: window.google.maps.TravelMode.DRIVING,
      });

      const distance = results.routes[0].legs[0].distance.value / 1000;
      dispatch(setPathDistance(distance.toFixed(2)));
      return results;
    } catch (error) {
      console.error("Error calculating directions:", error);
      return null;
    }
  };

  const handleListClick = async (place, placeType, index) => {
    if (
      selectedListPlace?.index === index &&
      selectedListPlace?.type === placeType
    ) {
      setSelectedListPlace(null);
      setDirections(null);
      dispatch(setPathDistance(null));
    } else {
      const results = await calculatePathDistance(place);
      if (results) {
        setSelectedListPlace({ place, type: placeType, index });
        setDirections(results);
        if (mapRef.current) {
          const bounds = new window.google.maps.LatLngBounds();
          bounds.extend(new window.google.maps.LatLng(latitude, longitude));
          bounds.extend(
            new window.google.maps.LatLng(
              place.location.latitude,
              place.location.longitude
            )
          );
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

  const handleLocationClick = (location) => {
    setSelectedMarker(location);
    if (mapRef.current) {
      mapRef.current.panTo({ lat: location.latitude, lng: location.longitude });
    }
    const element = document.getElementById(`loc-${location.id}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  };

  const handleTimeChange = (e) => {
    setTimeRange({ ...timeRange, [e.target.name]: e.target.value });
  };

  const openCrimeDetailsModal = () => {
    if (selectedCrime) {
      setShowCrimeDetailsModal(true);
    }
  };

  const closeCrimeDetailsModal = () => {
    setShowCrimeDetailsModal(false);
  };

  const toggleLocationList = () => {
    setShowLocationList(!showLocationList);
  };

  // Render helpers
  const renderMarkers = useCallback(
    (places, icon, show) => {
      if (!window.google || !show) return null;

      const placeIcon = {
        url: icon,
        scaledSize: new window.google.maps.Size(32, 32),
        anchor: new window.google.maps.Point(16, 32),
      };

      return places?.map((place, index) => {
        if (!place.location?.latitude || !place.location?.longitude)
          return null;

        const shouldShow =
          !selectedListPlace ||
          selectedListPlace.place === place ||
          place.displayName?.text === "Your Location";

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
    },
    [selectedListPlace]
  );

  const sortByDistance = (places) => {
    if (!latitude || !longitude || !places) return places;
    return [...places].sort((a, b) => {
      const distA = calculateDistance(
        latitude,
        longitude,
        a.location.latitude,
        a.location.longitude
      );
      const distB = calculateDistance(
        latitude,
        longitude,
        b.location.latitude,
        b.location.longitude
      );
      return distA - distB;
    });
  };

  if (!isLoaded) return <p>Loading Map...</p>;

  const sortedPoliceStations = sortByDistance(policeStations);
  const sortedHospitals = sortByDistance(hospitals);

  // Main render
  return (
    <div className="h-[calc(100vh-6.5rem)]">
      {isHistoryMode ? (
        <div className="bg-gray-50 p-2 h-full">
          {/* History Mode UI */}
          <div className="w-full mx-auto h-full">
            <div className="bg-white p-2 rounded-lg shadow-sm mb-2">
              <h1 className="text-2xl text-center font-bold text-gray-800">
                Location History
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FiCalendar className="mr-2" /> Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    max={new Date().toISOString().split("T")[0]}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FiClock className="mr-2" /> Start Time
                  </label>
                  <select
                    name="start"
                    value={timeRange.start}
                    onChange={handleTimeChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select start hour</option>
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>
                        {i === 0
                          ? "12 AM"
                          : i < 12
                          ? `${i} AM`
                          : i === 12
                          ? "12 PM"
                          : `${i - 12} PM`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 items-center">
                    <FiClock className="mr-2" /> End Time
                  </label>
                  <select
                    name="end"
                    value={timeRange.end}
                    onChange={handleTimeChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select end hour</option>
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>
                        {i === 0
                          ? "12 AM"
                          : i < 12
                          ? `${i} AM`
                          : i === 12
                          ? "12 PM"
                          : `${i - 12} PM`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-[calc(100%-10rem)]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-3 text-gray-600">Loading location history...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-[calc(100%-10rem)]">
                <div className="text-center text-red-600">
                  <FiAlertCircle className="mx-auto h-12 w-12" />
                  <p className="mt-3 text-lg">Error: {error}</p>
                </div>
              </div>
            ) : filteredLocations.length === 0 ? (
              <div className="bg-white p-8 rounded-lg shadow-sm text-center h-[calc(100%-10rem)] flex flex-col justify-center">
                <FiMapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">
                  No locations available
                </h3>
                <p className="mt-2 text-gray-500">
                  {locations.length === 0
                    ? `No location history found for ${new Date(date).toLocaleDateString()}`
                    : "No locations match your selected time range"}
                </p>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row h-[calc(100%-7.5rem)] gap-2">
                {isMobile && (
                  <button
                    onClick={toggleLocationList}
                    className="md:hidden bg-blue-500 text-white p-2 rounded-md"
                  >
                    {showLocationList ? "Hide List" : "Show List"}
                  </button>
                )}
                
                {(showLocationList || !isMobile) && (
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden w-full md:w-1/3">
                    <div className="p-4 bg-gray-50 border-b">
                      <h3 className="font-medium text-gray-900 flex items-center">
                        <FiMapPin className="mr-2" />
                        Locations ({filteredLocations.length})
                      </h3>
                    </div>
                    <div
                      className="divide-y divide-gray-200 overflow-y-auto"
                      style={{ height: isMobile ? "300px" : "100%" }}
                    >
                      {filteredLocations.map((loc) => (
                        <div
                          id={`loc-${loc.id}`}
                          key={loc.id}
                          className={`p-4 cursor-pointer transition-colors ${
                            selectedMarker?.id === loc.id
                              ? "bg-blue-50 border-l-4 border-blue-500"
                              : "hover:bg-gray-50"
                          }`}
                          onClick={() => handleLocationClick(loc)}
                        >
                          <div className="flex items-start">
                            <div
                              className={`h-3 w-3 rounded-full mt-1 mr-3 ${
                                selectedMarker?.id === loc.id
                                  ? "bg-blue-500"
                                  : "bg-gray-300"
                              }`}
                            ></div>
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {loc.displayName}
                              </h4>
                              <p className="text-sm text-gray-500 mt-1">
                                {new Date(loc.startTime).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                              <p className="text-sm text-gray-400 mt-1 truncate">
                                {loc.formattedAddress}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className={`${showLocationList && isMobile ? "hidden" : "block"} flex-1 bg-white rounded-lg shadow-sm overflow-hidden`}>
                  <GoogleMap
                    mapContainerStyle={{ width: "100%", height: "100%" }}
                    center={mapCenter}
                    zoom={12}
                    options={{
                      streetViewControl: false,
                      mapTypeControl: false,
                      fullscreenControl: false,
                    }}
                    onLoad={(map) => {
                      mapRef.current = map;
                      if (filteredLocations.length > 0) {
                        const bounds = new window.google.maps.LatLngBounds();
                        filteredLocations.forEach((loc) => {
                          bounds.extend(
                            new window.google.maps.LatLng(
                              loc.latitude,
                              loc.longitude
                            )
                          );
                        });
                        map.fitBounds(bounds);
                      }
                    }}
                  >
                    {filteredLocations.map((loc) => (
                      <Marker
                        key={loc.id}
                        position={{ lat: loc.latitude, lng: loc.longitude }}
                        icon={{
                          url: pathIcon,
                          scaledSize: new window.google.maps.Size(10, 10),
                        }}
                        onClick={() => handleLocationClick(loc)}
                      />
                    ))}

                    {selectedMarker && (
                      <InfoWindow
                        position={{
                          lat: selectedMarker.latitude,
                          lng: selectedMarker.longitude,
                        }}
                        options={{
                          disableAutoPan: true,
                          pixelOffset: new window.google.maps.Size(0, -9),
                        }}
                        onCloseClick={() => setSelectedMarker(null)}
                      >
                        <div className="max-w-xs">
                          <h4 className="font-bold text-gray-900">
                            {selectedMarker.displayName}
                          </h4>
                          <p className="text-sm text-gray-700 mt-1">
                            {selectedMarker.formattedAddress}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            <span className="font-medium">Time:</span>{" "}
                            {new Date(
                              selectedMarker.startTime
                            ).toLocaleTimeString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            <span className="font-medium">Date:</span>{" "}
                            {new Date(
                              selectedMarker.startTime
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </InfoWindow>
                    )}
                  </GoogleMap>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Full/Minimal Mode UI
        <div className="flex h-full">
          <div
            className={`${
              isFullMode && showPlaceButton && !isMobile ? "w-full md:w-[73%]" : "w-full"
            } transition-all duration-300`}
          >
            <GoogleMap
              center={mapCenter}
              zoom={14}
              mapContainerStyle={{ width: "100%", height: "100%" }}
              onClick={() => {
                setSelectedMarker(null);
                setSelectedCrime(null);
              }}
              onLoad={(map) => (mapRef.current = map)}
            >
              {isFullMode &&
                renderMarkers(sortedPoliceStations, icon1, showPoliceStations)}
              {isFullMode &&
                renderMarkers(sortedHospitals, icon2, showHospitals)}
              {renderMarkers(liveLocation, icon3, true)}

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

              {showCrimes &&
                crimesData &&
                crimesData.map((crime) => (
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

              {selectedCrime && (
                <InfoWindow
                  position={{
                    lat: selectedCrime.location.latitude,
                    lng: selectedCrime.location.longitude,
                  }}
                  options={{
                    disableAutoPan: true,
                    pixelOffset: new window.google.maps.Size(0, -30),
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
                      Distance:{" "}
                      {calculateDistance(
                        latitude,
                        longitude,
                        selectedCrime.location.latitude,
                        selectedCrime.location.longitude
                      ).toFixed(2)}{" "}
                      km away
                    </p>

                    <div className="flex justify-between mt-2 mb-2">
                      <div className="flex items-center gap-1 text-blue-600">
                        <FaThumbsUp />
                        {selectedCrime.likeCount}
                      </div>
                      <div className="flex items-center gap-1 text-red-600">
                        <FaThumbsDown />
                        {selectedCrime.unlikeCount}
                      </div>
                    </div>

                    {selectedCrime.crimePhotos?.length > 0 && (
                      <div className="mt-2">
                        <img
                          src={selectedCrime.crimePhotos[0]}
                          alt="Crime scene"
                          className="w-full h-auto rounded"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      </div>
                    )}

                    <button
                      onClick={openCrimeDetailsModal}
                      className="w-full mt-3 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors cursor-pointer"
                    >
                      View Details
                    </button>
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
                    <p className="font-bold">
                      {selectedMarker.displayName?.text || "Location"}
                    </p>
                  </div>
                </InfoWindow>
              )}

              {isFullMode && directions && (
                <DirectionsRenderer
                  directions={directions}
                  options={{
                    suppressMarkers: true,
                    polylineOptions: {
                      strokeColor: "#FF0000",
                      strokeOpacity: 0.8,
                      strokeWeight: 4,
                    },
                  }}
                />
              )}
            </GoogleMap>
          </div>

          {isFullMode && (
            <>
              {!isMobile && (
                <button
                  className="absolute top-[4.5rem] right-0 w-[3%] mt-0.5 p-1 bg-blue-600 text-white hover:opacity-50 cursor-pointer"
                  onClick={() => setShowPlaceButton(!showPlaceButton)}
                >
                  {showPlaceButton ? ">>" : "<<"}
                </button>
              )}

              {showPlaceButton && (
                <div
                  className={`${isMobile ? "fixed bottom-0 left-0 right-0 z-10" : "static"} 
                  w-full md:w-[27%] transition-all duration-300 h-[calc(100vh-4rem)] 
                  bg-white shadow-lg md:shadow-none`}
                >
                  {isMobile && (
                    <button
                      onClick={() => setShowPlaceButton(false)}
                      className="w-full bg-blue-500 text-white p-2"
                    >
                      Close Panel
                    </button>
                  )}
                  <div className="border-white border-2 bg-green-500 p-1">
                    <label className="text-white text-sm py-1 mx-3 text-center w-[90%]">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={showPoliceStations}
                        onChange={() => setShowPoliceStations(!showPoliceStations)}
                      />
                      <b>Police Station</b>
                    </label>
                    <label className="text-white text-sm py-1 mx-3 text-center w-[90%]">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={showHospitals}
                        onChange={() => setShowHospitals(!showHospitals)}
                      />
                      <b>Hospitals</b>
                    </label>
                    <label className="text-white text-sm py-1 mx-3 text-center w-[90%]">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={showCrimes}
                        onChange={() => setShowCrimes(!showCrimes)}
                      />
                      <b>Crimes</b>
                    </label>

                    {showCrimes && (
                      <div className="text-white text-md py-1 mx-3 text-center w-[90%]">
                        <p className="font-bold">Safety Score: {safetyScore}/100</p>
                        <p className="text-sm">
                          {crimesData && crimesData.length > 0
                            ? `${crimesData.length} crime${
                                crimesData.length !== 1 ? "s" : ""
                              } reported nearby`
                            : "No crimes reported nearby"}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="border-white border-2">
                    <p className="bg-green-500 text-white text-xl text-center w-[100%]">
                      Nearest PoliceStation
                    </p>
                  </div>
                  <div className="w-full bg-blue-200 h-[35%] overflow-x-hidden overflow-y-auto">
                    {sortedPoliceStations?.map((place, index) => (
                      <div
                        className={`p-1 border-white border-2 cursor-pointer ${
                          selectedListPlace?.type === "police" &&
                          selectedListPlace?.index === index
                            ? "bg-gray-300 shadow-md"
                            : "hover:bg-gray-100"
                        }`}
                        key={`police-${index}`}
                        onClick={() => handleListClick(place, "police", index)}
                      >
                        <p className="font-semibold">
                          {place.displayName.text || "Location"}
                        </p>
                        {selectedListPlace?.type === "police" &&
                          selectedListPlace?.index === index && (
                            <>
                              <p className="text-sm">
                                {place.formattedAddress || "Address"}
                              </p>
                              <p>
                                <span className="font-semibold">
                                  Path Distance:{" "}
                                </span>
                                {(
                                  directions?.routes[0]?.legs[0]?.distance?.value /
                                  1000
                                ).toFixed(2)}{" "}
                                km
                              </p>
                            </>
                          )}
                      </div>
                    ))}
                  </div>
                  <div className="border-white border-2">
                    <p className="bg-green-500 text-white text-xl text-center w-[100%]">
                      Nearest Hospitals
                    </p>
                  </div>
                  <div className="w-full bg-blue-200 h-[38%] overflow-x-hidden overflow-y-auto">
                    {sortedHospitals?.map((place, index) => (
                      <div
                        className={`p-1 border-white border-2 cursor-pointer ${
                          selectedListPlace?.type === "hospital" &&
                          selectedListPlace?.index === index
                            ? "bg-gray-300 shadow-md"
                            : "hover:bg-gray-100"
                        }`}
                        key={`hospital-${index}`}
                        onClick={() => handleListClick(place, "hospital", index)}
                      >
                        <p className="font-semibold">
                          {place.displayName.text || "Location"}
                        </p>
                        {selectedListPlace?.type === "hospital" &&
                          selectedListPlace?.index === index && (
                            <>
                              <p className="text-sm">
                                {place.formattedAddress || "Address"}
                              </p>
                              <p>
                                <span className="font-semibold">
                                  Path Distance:{" "}
                                </span>
                                {(
                                  directions?.routes[0]?.legs[0]?.distance?.value /
                                  1000
                                ).toFixed(2)}{" "}
                                km
                              </p>
                            </>
                          )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isMobile && !showPlaceButton && (
                <button
                  onClick={() => setShowPlaceButton(true)}
                  className="fixed bottom-4 right-4 bg-blue-500 text-white p-3 rounded-full shadow-lg z-10"
                >
                  Show Controls
                </button>
              )}
            </>
          )}
        </div>
      )}

      {showCrimeDetailsModal && selectedCrime && (
        <CrimeDetailsModal
          crime={selectedCrime}
          onClose={closeCrimeDetailsModal}
        />
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

// Mode-specific components
export const FullMapView = () => <MapView mode={MAP_MODES.FULL} />;
export const MinimalMapView = () => <MapView mode={MAP_MODES.MINIMAL} />;
export const HistoryMapView = () => <MapView mode={MAP_MODES.HISTORY} />;

export default MapView;