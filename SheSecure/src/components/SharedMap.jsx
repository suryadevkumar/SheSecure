import React, { useState, useEffect, useCallback } from "react";
import {
  GoogleMap,
  Marker,
  Polyline,
  InfoWindow,
  LoadScript,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { useSearchParams } from "react-router-dom";
import io from "socket.io-client";
import { api, googleMapAPI1, wsUrl } from "../config/config";
import calculateDistance from "../utils/calculateDistance";
import victimIcon from "../assets/location1.png";
import helperIcon from "../assets/liveLocation.png";
import liveIcon from "../assets/location1.png";
import { toast } from "react-toastify";

const libraries = ["places", "directions"];
const mapContainerStyle = {
  width: "100%",
  height: `${window.innerHeight - 4 * 20}px`,
};

const center = {
  lat: 0,
  lng: 0,
};

// Helper function for consistent date/time formatting
const formatDateTime = (timestamp) => {
  const date = new Date(timestamp);
  return {
    dateStr: date.toLocaleDateString(),
    timeStr: date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    fullDateTime: date.toLocaleString(),
  };
};

const SharedMap = () => {
  const [searchParams] = useSearchParams();
  const reportId = searchParams.get("reportId");
  const shareId = searchParams.get("shareId");

  // Determine map mode based on URL params
  const mapMode = reportId ? "sos" : shareId ? "liveLocation" : null;

  // Common state
  const [map, setMap] = useState(null);
  const [status, setStatus] = useState("Loading...");
  const [socket, setSocket] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [helperLocation, setHelperLocation] = useState(null);
  const [showHelperLocation, setShowHelperLocation] = useState(false);
  const [directions, setDirections] = useState(null);
  const [watchId, setWatchId] = useState(null);
  const [mapError, setMapError] = useState(null);
  const [selectedHelper, setSelectedHelper] = useState(null);
  const [distanceToVictim, setDistanceToVictim] = useState(null);

  // SOS specific state
  const [victimPath, setVictimPath] = useState([]);
  const [liveVictimPath, setLiveVictimPath] = useState([]);
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [sosData, setSOSData] = useState(null);

  // Live location specific state
  const [liveLocations, setLiveLocations] = useState([]);
  const [isLiveActive, setIsLiveActive] = useState(false);

  // Session end notification
  const [showEndNotification, setShowEndNotification] = useState(false);
  const [endNotificationMessage, setEndNotificationMessage] = useState("");

  // Initialize socket connection
  useEffect(() => {
    if (!mapMode) {
      setStatus("No tracking ID provided");
      return;
    }

    let namespace = "";
    if (mapMode === "liveLocation") {
      namespace = "/location";
    }

    const newSocket = io(`${wsUrl}${namespace}`);
    setSocket(newSocket);

    // Join appropriate room
    if (mapMode === "sos" && reportId) {
      newSocket.emit("joinSOS", reportId);
    } else if (mapMode === "liveLocation" && shareId) {
      newSocket.emit("location:join", shareId, (response) => {
        if (!response?.success) {
          setStatus(
            `Error: ${
              response?.message || "Failed to join live location sharing"
            }`
          );
          setMapError("Failed to join live location room");
        }
      });
    }

    return () => {
      newSocket.disconnect();
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [reportId, shareId, mapMode]);

  // SOS socket event listeners
  useEffect(() => {
    if (!socket || mapMode !== "sos") return;

    const onVictimLocationUpdate = (newLocation) => {
      setLiveVictimPath((prev) => [...prev, newLocation]);
    };

    const onVictimPathUpdate = (fullPath) => {
      setLiveVictimPath(fullPath);
    };

    // In UnifiedMap.js, ensure the onStatusUpdate handler is properly set up

    const onStatusUpdate = ({ status, startTime, endTime }) => {
      setIsSOSActive(status === "active");

      if (status === "active") {
        const { dateStr, timeStr } = formatDateTime(startTime);
        setStatus(
          <span style={{ color: "green", fontWeight: "bold" }}>
            SOS LIVE TRACKING - Active since {dateStr} {timeStr}
          </span>
        );
      } else {
        // SOS has ended - Set status to inactive
        const start = formatDateTime(startTime);
        const end = formatDateTime(endTime);

        // Update status
        setStatus(
          <span style={{ color: "red", fontWeight: "bold" }}>
            SOS ENDED - {start.dateStr} {start.timeStr} to {end.dateStr}{" "}
            {end.timeStr}
          </span>
        );

        // Show notification immediately when SOS deactivates
        setEndNotificationMessage("SOS has been deactivated.");
        setShowEndNotification(true);

        // Fetch latest history immediately from server
        if (reportId) {
          fetchVictimData();
        }
      }
    };

    socket.on("locationUpdate", onVictimLocationUpdate);
    socket.on("pathUpdate", onVictimPathUpdate);
    socket.on("statusUpdate", onStatusUpdate);

    return () => {
      socket.off("locationUpdate", onVictimLocationUpdate);
      socket.off("pathUpdate", onVictimPathUpdate);
      socket.off("statusUpdate", onStatusUpdate);
    };
  }, [socket, mapMode]);

  // Live location socket event listeners
  useEffect(() => {
    if (!socket || mapMode !== "liveLocation") return;

    const onLocationUpdate = (newLocation) => {
      setLiveLocations((prev) => [...prev, newLocation]);
      setIsLiveActive(true);
      setStatus(
        <span style={{ color: "blue", fontWeight: "bold" }}>
          LIVE LOCATION SHARING - Active
        </span>
      );
    };

    const onLocationHistory = (history) => {
      setLiveLocations(history);
      if (history.length > 0) {
        setIsLiveActive(true);
        setStatus(
          <span style={{ color: "blue", fontWeight: "bold" }}>
            LIVE LOCATION SHARING - Active
          </span>
        );
      }
    };

    const onSessionEnded = () => {
      setIsLiveActive(false);
      setStatus(
        <span style={{ color: "red", fontWeight: "bold" }}>
          LOCATION SHARING ENDED
        </span>
      );

      // Show notification about session ending
      setEndNotificationMessage(
        "Live location sharing has ended. The user has stopped sharing their location."
      );
      setShowEndNotification(true);
    };

    socket.on("location:update", onLocationUpdate);
    socket.on("location:history", onLocationHistory);
    socket.on("location:session_ended", onSessionEnded);

    return () => {
      socket.off("location:update", onLocationUpdate);
      socket.off("location:history", onLocationHistory);
      socket.off("location:session_ended", onSessionEnded);
    };
  }, [socket, mapMode]);

  // Fetch initial data based on map mode
  useEffect(() => {
    if (!mapMode) return;

    if (mapMode === "sos" && reportId) {
      fetchVictimData();
    }
  }, [reportId, mapMode]);

  // Fetch victim data for SOS mode
  const fetchVictimData = async () => {
    try {
      const response = await fetch(api + "/sos/sos-liveLocation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) throw new Error(data.message);

      // Store the full SOS data for reference
      setSOSData(data);

      // Always set locationHistory regardless of SOS status
      setVictimPath(data.locationHistory || []);

      // Always set liveLocations regardless of SOS status
      setLiveVictimPath(data.liveLocations || []);

      setIsSOSActive(data.status === "active");

      if (data.status === "active") {
        const { dateStr, timeStr } = formatDateTime(data.startSosTime);
        setStatus(
          <span style={{ color: "green", fontWeight: "bold" }}>
            SOS LIVE TRACKING - Active since {dateStr} {timeStr}
          </span>
        );
      } else {
        const start = formatDateTime(data.startSosTime);
        const end = formatDateTime(data.endSosTime);
        setStatus(
          <span style={{ color: "red", fontWeight: "bold" }}>
            SOS ENDED - {start.dateStr} {start.timeStr} to {end.dateStr}{" "}
            {end.timeStr}
          </span>
        );
      }
    } catch (error) {
      console.error("Error fetching victim data", error);
      setStatus(`Error: ${error.message}`);
    }
  };

  // Fit map to all points
  useEffect(() => {
    if (!map || !window.google) return;

    const bounds = new window.google.maps.LatLngBounds();
    let hasPoints = false;

    // Add SOS points if in SOS mode - always show both paths regardless of active status
    if (mapMode === "sos") {
      // Add historical victim points
      if (victimPath?.length > 0) {
        victimPath.forEach((point) => {
          bounds.extend(
            new window.google.maps.LatLng(point.latitude, point.longitude)
          );
          hasPoints = true;
        });
      }

      // Add live victim points
      if (liveVictimPath?.length > 0) {
        liveVictimPath.forEach((point) => {
          bounds.extend(
            new window.google.maps.LatLng(point.latitude, point.longitude)
          );
          hasPoints = true;
        });
      }
    }

    // Add live location points if in live location mode
    if (mapMode === "liveLocation" && liveLocations?.length > 0) {
      liveLocations.forEach((point) => {
        bounds.extend(
          new window.google.maps.LatLng(point.latitude, point.longitude)
        );
        hasPoints = true;
      });
    }

    // Add helper location if available
    if (helperLocation) {
      bounds.extend(
        new window.google.maps.LatLng(helperLocation.lat, helperLocation.lng)
      );
      hasPoints = true;
    }

    if (hasPoints) {
      map.fitBounds(bounds);
      if (map.getZoom() > 15) map.setZoom(15);
    }
  }, [map, victimPath, liveVictimPath, liveLocations, helperLocation, mapMode]);

  // Calculate distance when locations change
  useEffect(() => {
    if (!helperLocation) {
      setDistanceToVictim(null);
      return;
    }

    const targetLocation = getLatestTargetLocation();
    if (!targetLocation) return;

    const distance = calculateDistance(
      helperLocation.lat,
      helperLocation.lng,
      targetLocation.latitude || targetLocation.lat,
      targetLocation.longitude || targetLocation.lng
    );
    setDistanceToVictim(distance);
  }, [helperLocation, liveVictimPath, liveLocations, victimPath]);

  // Calculate directions when locations change
  useEffect(() => {
    if (!showHelperLocation || !helperLocation) return;

    const targetLocation = getLatestTargetLocation();
    if (!targetLocation) return;

    calculateDirections(helperLocation, {
      lat: targetLocation.latitude || targetLocation.lat,
      lng: targetLocation.longitude || targetLocation.lng,
    });
  }, [
    helperLocation,
    liveVictimPath,
    liveLocations,
    showHelperLocation,
    victimPath,
  ]);

  // Helper function to get the latest location based on map mode
  const getLatestTargetLocation = () => {
    if (mapMode === "sos") {
      // First check for active live path points
      if (liveVictimPath?.length > 0) {
        return liveVictimPath[liveVictimPath.length - 1];
      }
      // Then check for historical points
      if (victimPath?.length > 0) {
        return victimPath[victimPath.length - 1];
      }
    } else if (mapMode === "liveLocation") {
      if (liveLocations?.length > 0) {
        return liveLocations[liveLocations.length - 1];
      }
    }
    return null;
  };

  const calculateDirections = useCallback((origin, destination) => {
    if (!window.google || !window.google.maps) {
      console.error("Google Maps not loaded");
      return;
    }

    const directionsService = new window.google.maps.DirectionsService();

    directionsService.route(
      {
        origin,
        destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
        drivingOptions: {
          departureTime: new Date(),
          trafficModel: "bestguess",
        },
        unitSystem: window.google.maps.UnitSystem.METRIC,
      },
      (result, status) => {
        if (status === "OK") {
          setDirections(result);
        } else {
          console.error("Directions request failed:", {
            status,
            origin,
            destination,
            errorDetails: result,
          });
          setDirections(null);
        }
      }
    );
  }, []);

  const handleHelperToggle = () => {
    if (!showHelperLocation) {
      if (navigator.geolocation) {
        const id = navigator.geolocation.watchPosition(
          (position) => {
            const pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              timestamp: Date.now(),
              accuracy: position.coords.accuracy,
            };
            setHelperLocation(pos);
          },
          (error) => {
            console.error("Geolocation error:", error);
            toast.error("Error getting location. Please enable location services.");
          },
          { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
        );
        setWatchId(id);
        setShowHelperLocation(true);
      } else {
        toast.error("Geolocation not supported by this browser");
      }
    } else {
      if (watchId) navigator.geolocation.clearWatch(watchId);
      setShowHelperLocation(false);
      setHelperLocation(null);
      setDirections(null);
      setSelectedHelper(null);
    }
  };

  const onMapLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
  }, []);

  const formatDistance = (meters) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${Math.round(meters)} meters`;
  };

  // Handle notification close
  const handleCloseNotification = () => {
    setShowEndNotification(false);
  };

  if (!mapMode) {
    return (
      <div className="status-message error">
        No tracking parameters provided
      </div>
    );
  }

  return (
    <>
      {mapError && (
        <div className="error-banner">
          {mapError} - Please verify your API key and enabled services
        </div>
      )}

      {/* Session End Notification Modal */}
      {showEndNotification && (
        <div className="notification-overlay">
          <div className="notification-modal">
            <div className="notification-header">
              <h3>
                {mapMode === "sos" ? "SOS Deactivated" : "Live Location Ended"}
              </h3>
            </div>
            <div className="notification-body">
              <p>{endNotificationMessage}</p>
              {mapMode === "liveLocation" && (
                <p>The location history is still visible on the map.</p>
              )}
              {mapMode === "sos" && (
                <p>The SOS history is still visible on the map.</p>
              )}
            </div>
            <div className="notification-footer">
              <button
                onClick={handleCloseNotification}
                className="notification-btn"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <LoadScript
        googleMapsApiKey={googleMapAPI1}
        libraries={libraries}
        onError={() => setMapError("Failed to load Google Maps API")}
        onLoad={() => setMapError(null)}
      >
        <div className="emergency-map-container">
          <div className="flex mt-20">
            <div
              className={`status-message ${
                mapMode === "sos"
                  ? isSOSActive
                    ? "active"
                    : "inactive"
                  : isLiveActive
                  ? "active-live"
                  : "inactive"
              }`}
            >
              {status}
            </div>
            <div className="ml-4 flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showHelperLocation}
                  onChange={handleHelperToggle}
                  className="mr-2"
                />
                <b>Show Direction</b>
              </label>
              {distanceToVictim !== null && (
                <span className="ml-4 bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-sm">
                  <b>Distance: </b>
                  {formatDistance(distanceToVictim)}
                </span>
              )}
            </div>
          </div>

          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={10}
            onLoad={onMapLoad}
            onClick={() => {
              setSelectedMarker(null);
              setSelectedHelper(null);
            }}
          >
            {/* SOS MODE: Victim's historical path - Always show regardless of active status */}
            {mapMode === "sos" && victimPath && victimPath.length > 0 && (
              <Polyline
                path={victimPath.map((p) => ({
                  lat: p.latitude,
                  lng: p.longitude,
                }))}
                options={{
                  strokeColor: "#FF0000",
                  strokeOpacity: 0.7,
                  strokeWeight: 5,
                  zIndex: 1,
                }}
              />
            )}

            {/* SOS MODE: Victim's live path - Always show but with different color if active */}
            {mapMode === "sos" &&
              liveVictimPath &&
              liveVictimPath.length > 0 && (
                <Polyline
                  path={liveVictimPath.map((p) => ({
                    lat: p.latitude,
                    lng: p.longitude,
                  }))}
                  options={{
                    strokeColor: isSOSActive ? "#FFFF00" : "#FF8800",
                    strokeOpacity: 1,
                    strokeWeight: 5,
                    zIndex: 2,
                  }}
                />
              )}

            {/* SOS MODE: Victim's markers - Always show historical points regardless of active status */}
            {mapMode === "sos" &&
              victimPath &&
              victimPath.map((point, index) => (
                <Marker
                  key={`victim-history-${index}-${
                    point.timestamp || point.endTime
                  }`}
                  position={{ lat: point.latitude, lng: point.longitude }}
                  icon={{
                    url: victimIcon,
                    scaledSize: new window.google.maps.Size(32, 32),
                  }}
                  onClick={() =>
                    setSelectedMarker({ ...point, type: "historical" })
                  }
                  zIndex={3}
                />
              ))}

            {/* SOS MODE: Victim's markers - Always show live points regardless of active status */}
            {mapMode === "sos" &&
              liveVictimPath &&
              liveVictimPath.map((point, index) => (
                <Marker
                  key={`victim-live-${index}-${
                    point.timestamp || point.endTime
                  }`}
                  position={{ lat: point.latitude, lng: point.longitude }}
                  icon={{
                    url: victimIcon,
                    scaledSize: new window.google.maps.Size(32, 32),
                  }}
                  onClick={() => setSelectedMarker({ ...point, type: "live" })}
                  zIndex={3}
                />
              ))}

            {/* LIVE LOCATION MODE: User's path - Always show path history, regardless of active status */}
            {mapMode === "liveLocation" &&
              liveLocations &&
              liveLocations.length > 0 && (
                <Polyline
                  path={liveLocations.map((p) => ({
                    lat: p.latitude,
                    lng: p.longitude,
                  }))}
                  options={{
                    strokeColor: isLiveActive ? "#4285F4" : "#808080", // Gray when inactive
                    strokeOpacity: isLiveActive ? 0.8 : 0.6,
                    strokeWeight: 5,
                    zIndex: 1,
                  }}
                />
              )}

            {/* LIVE LOCATION MODE: User's markers - Always show markers, regardless of active status */}
            {mapMode === "liveLocation" &&
              liveLocations &&
              liveLocations.map((point, index) => (
                <Marker
                  key={`live-${index}-${point.timestamp}`}
                  position={{ lat: point.latitude, lng: point.longitude }}
                  icon={{
                    url: liveIcon,
                    scaledSize: new window.google.maps.Size(32, 32),
                  }}
                  onClick={() =>
                    setSelectedMarker({ ...point, isLiveLocation: true })
                  }
                  zIndex={3}
                />
              ))}

            {/* Helper's location */}
            {showHelperLocation && helperLocation && (
              <Marker
                position={helperLocation}
                icon={{
                  url: helperIcon,
                  scaledSize: new window.google.maps.Size(32, 32),
                }}
                zIndex={4}
                onClick={() => setSelectedHelper(helperLocation)}
              />
            )}

            {/* Directions from helper to target */}
            {directions && (
              <DirectionsRenderer
                options={{
                  directions,
                  polylineOptions: {
                    strokeColor: "#4285F4",
                    strokeOpacity: 0.8,
                    strokeWeight: 5,
                    zIndex: 5,
                  },
                  suppressMarkers: true,
                }}
              />
            )}

            {/* Info window for selected marker */}
            {selectedMarker && (
              <InfoWindow
                position={{
                  lat: selectedMarker.latitude || selectedMarker.lat,
                  lng: selectedMarker.longitude || selectedMarker.lng,
                }}
                options={{
                  disableAutoPan: true,
                  pixelOffset: new window.google.maps.Size(0, -30),
                }}
                onCloseClick={() => setSelectedMarker(null)}
              >
                <div>
                  <p className="font-bold">
                    {selectedMarker.isLiveLocation
                      ? "User Location"
                      : selectedMarker.type === "historical"
                      ? "Victim Historical Location"
                      : "Victim Live Location"}
                  </p>
                  <p>
                    {new Date(
                      selectedMarker.timestamp || selectedMarker.endTime
                    ).toLocaleString()}
                  </p>
                </div>
              </InfoWindow>
            )}

            {/* Info window for selected helper */}
            {selectedHelper && (
              <InfoWindow
                position={{ lat: selectedHelper.lat, lng: selectedHelper.lng }}
                options={{
                  disableAutoPan: true,
                  pixelOffset: new window.google.maps.Size(0, -30),
                }}
                onCloseClick={() => setSelectedHelper(null)}
              >
                <div>
                  <p className="font-bold">Your Location</p>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </div>
        <style>
          {`
          .gm-ui-hover-effect {
            display: none !important;
          }
          .status-message.active {
            color: green;
            font-weight: bold;
          }
          .status-message.inactive {
            color: red;
            font-weight: bold;
          }
          .status-message.active-live {
            color: blue;
            font-weight: bold;
          }
          .status-message.error {
            color: red;
            font-weight: bold;
            text-align: center;
            margin: 20px;
          }
          .error-banner {
            background-color: #f8d7da;
            color: #721c24;
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 10px;
            text-align: center;
          }
          
          /* Notification Modal Styles */
          .notification-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
          }
          
          .notification-modal {
            background-color: white;
            border-radius: 8px;
            width: 90%;
            max-width: 500px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            overflow: hidden;
          }
          
          .notification-header {
            background-color: #f44336;
            color: white;
            padding: 15px 20px;
          }
          
          .notification-header h3 {
            margin: 0;
            font-size: 18px;
          }
          
          .notification-body {
            padding: 20px;
            font-size: 16px;
          }
          
          .notification-footer {
            padding: 15px 20px;
            text-align: right;
            border-top: 1px solid #e0e0e0;
          }
          
          .notification-btn {
            background-color: #f44336;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
          }
          
          .notification-btn:hover {
            background-color: #d32f2f;
          }
        `}
        </style>
      </LoadScript>
    </>
  );
};

export default SharedMap;
