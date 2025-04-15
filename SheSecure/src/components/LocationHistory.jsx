import React, { useState, useEffect, useRef } from "react";
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from "@react-google-maps/api";
import { useSelector } from "react-redux";
import { fetchLocationHistory } from "../routes/location-routes";
import { googleMapAPI } from "../config/config";
import pathIcon from "../assets/pathDot.png";
import { FiClock, FiCalendar, FiMapPin, FiAlertCircle } from "react-icons/fi";

const mapContainerStyle = {
  width: "100%",
  height: "calc(100vh - 14rem)",
  borderRadius: "0.5rem",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
};

const center = {
  lat: 0,
  lng: 0,
};

function LocationHistory() {
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [timeRange, setTimeRange] = useState({ start: "", end: "" });
  const mapRef = useRef(null);
  const listContainerRef = useRef(null);

  const token = useSelector((state) => state.auth.token);

  const { isLoaded: apiLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: googleMapAPI,
    libraries: ['places'],
  });

  // Fetch location history
  useEffect(() => {
    const fetchData = async () => {
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
            if (data.length > 0) setSelectedLocation(data[0]);
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
    fetchData();
  }, [date, token]);

  // Apply time filter
  useEffect(() => {
    if (!timeRange.start || !timeRange.end) {
      setFilteredLocations(locations);
      return;
    }

    const startHour = parseInt(timeRange.start);
    const endHour = parseInt(timeRange.end);
    const filtered = locations.filter((loc) => {
      return loc.hour >= startHour && loc.hour <= endHour;
    });
    setFilteredLocations(filtered);
    if (filtered.length > 0) setSelectedLocation(filtered[0]);
  }, [timeRange, locations]);

  // Center map on locations
  useEffect(() => {
    if (mapRef.current && apiLoaded && filteredLocations.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      filteredLocations.forEach((loc) => {
        bounds.extend(
          new window.google.maps.LatLng(loc.latitude, loc.longitude)
        );
      });
      mapRef.current.fitBounds(bounds);
    }
  }, [filteredLocations, apiLoaded]);

  const handleLocationClick = (location) => {
    setSelectedLocation(location);
    if (mapRef.current) {
      mapRef.current.panTo({ lat: location.latitude, lng: location.longitude });
    }
    // Scroll to item in list
    const element = document.getElementById(`loc-${location.id}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  };

  const handleTimeChange = (e) => {
    setTimeRange({ ...timeRange, [e.target.name]: e.target.value });
  };

  if (loadError) {
    return (
      <div className="flex items-center justify-center" style={{ height: "calc(100vh - 14rem)" }}>
        <div className="text-center text-red-600">
          <FiAlertCircle className="mx-auto h-12 w-12" />
          <p className="mt-3 text-lg">Error: Failed to load Google Maps</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: "calc(100vh - 14rem)" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading location history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center" style={{ height: "calc(100vh - 14rem)" }}>
        <div className="text-center text-red-600">
          <FiAlertCircle className="mx-auto h-12 w-12" />
          <p className="mt-3 text-lg">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-2" style={{ minHeight: "calc(100vh - 14rem)" }}>
      <div className="w-full mx-auto">
        {/* Filters */}
        <div className="bg-white p-2 rounded-lg shadow-sm mb-2">
          <h1 className="text-2xl text-center font-bold text-gray-800 mb-4">
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
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
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

        {/* Content */}
        {filteredLocations.length === 0 ? (
          <div
            className="bg-white p-8 rounded-lg shadow-sm text-center"
            style={{ minHeight: "calc(100vh - 14rem)" }}
          >
            <FiMapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">
              No locations available
            </h3>
            <p className="mt-2 text-gray-500">
              {locations.length === 0
                ? `No location history found for ${new Date(
                    date
                  ).toLocaleDateString()}`
                : "No locations match your selected time range"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Location List */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 bg-gray-50 border-b">
                <h3 className="font-medium text-gray-900 flex items-center">
                  <FiMapPin className="mr-2" />
                  Locations ({filteredLocations.length})
                </h3>
              </div>
              <div
                ref={listContainerRef}
                className="divide-y divide-gray-200 overflow-y-auto"
                style={{ maxHeight: "calc(100vh - 18rem)" }}
              >
                {filteredLocations.map((loc) => (
                  <div
                    id={`loc-${loc.id}`}
                    key={loc.id}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedLocation?.id === loc.id
                        ? "bg-blue-50 border-l-4 border-blue-500"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => handleLocationClick(loc)}
                  >
                    <div className="flex items-start">
                      <div
                        className={`h-3 w-3 rounded-full mt-1 mr-3 ${
                          selectedLocation?.id === loc.id
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

            {/* Map */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden h-full">
                {apiLoaded ? (
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={center}
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
                          scaledSize: new window.google.maps.Size(
                            selectedLocation?.id === loc.id ? 10 : 10,
                            selectedLocation?.id === loc.id ? 10 : 10
                          ),
                        }}
                        onClick={() => handleLocationClick(loc)}
                      />
                    ))}

                    {selectedLocation && (
                      <InfoWindow
                        position={{
                          lat: selectedLocation.latitude,
                          lng: selectedLocation.longitude,
                        }}
                        options={{
                          disableAutoPan: true,
                          pixelOffset: new window.google.maps.Size(0, -9),
                        }}
                        onCloseClick={() => setSelectedLocation(null)}
                      >
                        <div className="max-w-xs">
                          <h4 className="font-bold text-gray-900">
                            {selectedLocation.displayName}
                          </h4>
                          <p className="text-sm text-gray-700 mt-1">
                            {selectedLocation.formattedAddress}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            <span className="font-medium">Time:</span>{" "}
                            {new Date(
                              selectedLocation.startTime
                            ).toLocaleTimeString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            <span className="font-medium">Date:</span>{" "}
                            {new Date(
                              selectedLocation.startTime
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </InfoWindow>
                    )}
                  </GoogleMap>
                ) : (
                  <div
                    className="flex items-center justify-center"
                    style={{ height: "calc(100vh - 14rem)" }}
                  >
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                      <p className="mt-3 text-gray-600">Loading map...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LocationHistory;