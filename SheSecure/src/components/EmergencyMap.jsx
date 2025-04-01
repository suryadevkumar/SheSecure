import React, { useState, useEffect, useCallback } from "react";
import { GoogleMap, Marker, Polyline, InfoWindow, LoadScript, DirectionsRenderer } from "@react-google-maps/api";
import { useSearchParams } from "react-router-dom";
import io from "socket.io-client";
import { api, googleMapAPI1 } from "../config/config";
import calculateDistance from "../utils/calculateDistance";
import victimIcon from '../assets/location1.png';
import helperIcon from '../assets/location2.png';

const mapContainerStyle = {
  width: '100%',
  height: `${window.innerHeight - 4 * 20}px`,
};

const center = {
  lat: 0,
  lng: 0
};

// Helper function for consistent date/time formatting
const formatDateTime = (timestamp) => {
  const date = new Date(timestamp);
  return {
    dateStr: date.toLocaleDateString(),
    timeStr: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    fullDateTime: date.toLocaleString()
  };
};

function EmergencyMap() {
  const [searchParams] = useSearchParams();
  const reportId = searchParams.get('reportId');
  const [victimPath, setVictimPath] = useState([]);
  const [liveVictimPath, setLiveVictimPath] = useState([]);
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [map, setMap] = useState(null);
  const [status, setStatus] = useState('Loading...');
  const [socket, setSocket] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [helperLocation, setHelperLocation] = useState(null);
  const [showHelperLocation, setShowHelperLocation] = useState(false);
  const [directions, setDirections] = useState(null);
  const [watchId, setWatchId] = useState(null);
  const [mapError, setMapError] = useState(null);
  const [selectedHelper, setSelectedHelper] = useState(null);
  const [distanceToVictim, setDistanceToVictim] = useState(null);

  // Initialize socket connection
  useEffect(() => {
    if (!reportId) return;
    
    const newSocket = io("http://localhost:3000");
    setSocket(newSocket);
    newSocket.emit("joinSOS", reportId);

    return () => {
      newSocket.disconnect();
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [reportId]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const onVictimLocationUpdate = (newLocation) => {
      setLiveVictimPath(prev => [...prev, newLocation]);
    };

    const onVictimPathUpdate = (fullPath) => {
      setLiveVictimPath(fullPath);
    };

    const onStatusUpdate = ({ status, startTime, endTime }) => {
      setIsSOSActive(status === 'active');
      
      if (status === 'active') {
        const { dateStr, timeStr } = formatDateTime(startTime);
        setStatus(`LIVE TRACKING - Active since ${dateStr} ${timeStr}`);
      } else {
        const start = formatDateTime(startTime);
        const end = formatDateTime(endTime);
        setStatus(`SOS ENDED - ${start.dateStr} ${start.timeStr} to ${end.dateStr} ${end.timeStr}`);
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
  }, [socket]);

  // Fetch initial victim data
  useEffect(() => {
    if (!reportId) {
      setStatus('No SOS report ID provided');
      return;
    }

    const fetchVictimData = async () => {
      try {
        const response = await fetch(api + "/sos/sos-liveLocation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reportId }),
        });
        
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.message);
        
        setVictimPath(data.locationHistory || []);
        setLiveVictimPath(data.liveLocations || []);
        setIsSOSActive(data.status === 'active');
        
        if (data.status === 'active') {
          const { dateStr, timeStr } = formatDateTime(data.startSosTime);
          setStatus(<span style={{ color: 'green', fontWeight: 'bold' }}>
            LIVE TRACKING - Active since {dateStr} {timeStr}
          </span>)
        } else {
          const start = formatDateTime(data.startSosTime);
          const end = formatDateTime(data.endSosTime);
          setStatus(<span style={{ color: 'red', fontWeight: 'bold' }}>
              SOS ENDED - {start.dateStr} {start.timeStr} to {end.dateStr} {end.timeStr}
            </span>)
        }
      } catch (error) {
        console.error("Error fetching victim data", error);
        setStatus(`Error: ${error.message}`);
      }
    };

    fetchVictimData();
  }, [reportId]);

  // Fit map to all points
  useEffect(() => {
    if (!map || !window.google) return;
    
    const bounds = new window.google.maps.LatLngBounds();
    const allPoints = [...victimPath, ...liveVictimPath];
    
    allPoints.forEach(point => {
      bounds.extend(new window.google.maps.LatLng(point.latitude, point.longitude));
    });

    if (helperLocation) {
      bounds.extend(new window.google.maps.LatLng(helperLocation.lat, helperLocation.lng));
    }

    if (allPoints.length > 0 || helperLocation) {
      map.fitBounds(bounds);
      if (map.getZoom() > 15) map.setZoom(15);
    }
  }, [map, victimPath, liveVictimPath, helperLocation]);

  // Calculate distance when locations change
  useEffect(() => {
    if (!helperLocation) {
      setDistanceToVictim(null);
      return;
    }

    const victimLocation = getLatestVictimLocation();
    if (!victimLocation) return;

    const distance = calculateDistance(
      helperLocation.lat,
      helperLocation.lng,
      victimLocation.latitude,
      victimLocation.longitude
    );
    setDistanceToVictim(distance);
  }, [helperLocation, liveVictimPath]);

  // Calculate directions when locations change
  useEffect(() => {
    if (!showHelperLocation || !helperLocation) return;
    
    const victimLocation = getLatestVictimLocation();
    if (!victimLocation) return;

    calculateDirections(
      helperLocation,
      { lat: victimLocation.latitude, lng: victimLocation.longitude }
    );
  }, [helperLocation, liveVictimPath, showHelperLocation]);

  const getLatestVictimLocation = () => {
    if (liveVictimPath.length > 0) return liveVictimPath[liveVictimPath.length - 1];
    if (victimPath.length > 0) return victimPath[victimPath.length - 1];
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
          trafficModel: "bestguess"
        },
        unitSystem: window.google.maps.UnitSystem.METRIC
      },
      (result, status) => {
        if (status === "OK") {
          setDirections(result);
        } else {
          console.error("Directions request failed:", {
            status,
            origin,
            destination,
            errorDetails: result
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
              accuracy: position.coords.accuracy
            };
            setHelperLocation(pos);
          },
          (error) => {
            console.error("Geolocation error:", error);
            alert("Error getting location. Please enable location services.");
          },
          { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
        );
        setWatchId(id);
        setShowHelperLocation(true);
      } else {
        alert("Geolocation not supported by this browser");
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

  if (!reportId) {
    return <div className="status-message error">No SOS report ID provided</div>;
  }

  return (
    <>
      {mapError && (
        <div className="error-banner">
          {mapError} - Please verify your Google Maps API key and enabled services
        </div>
      )}
      
      <LoadScript 
        googleMapsApiKey={googleMapAPI1}
        libraries={["places", "directions"]}
        onError={() => setMapError("Failed to load Google Maps API")}
        onLoad={() => setMapError(null)}
      >
        <div className="emergency-map-container">
          <div className="flex">
            <div className={`status-message ${isSOSActive ? 'active' : 'inactive'}`}>
              {status}
            </div>
            <div className="ml-20 flex items-center">
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
                <span className="ml-20 bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-sm">
                  <b>Distance: </b>{formatDistance(distanceToVictim)}
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
            {/* Victim's historical path */}
            {victimPath.length > 0 && (
              <Polyline 
                path={victimPath.map(p => ({ lat: p.latitude, lng: p.longitude }))} 
                options={{ 
                  strokeColor: "#FF0000", 
                  strokeOpacity: 0.7, 
                  strokeWeight: 5,
                  zIndex: 1
                }} 
              />
            )}
            
            {/* Victim's live path (if active) */}
            {isSOSActive && liveVictimPath.length > 0 && (
              <Polyline 
                path={liveVictimPath.map(p => ({ lat: p.latitude, lng: p.longitude }))} 
                options={{ 
                  strokeColor: "#FFFF00", 
                  strokeOpacity: 1, 
                  strokeWeight: 5,
                  zIndex: 2
                }} 
              />
            )}
            
            {/* Victim's markers */}
            {[...victimPath, ...liveVictimPath].map((point, index) => (
              <Marker 
                key={`victim-${index}-${point.timestamp || point.endTime}`}
                position={{ lat: point.latitude, lng: point.longitude }}
                icon={{ url: victimIcon, scaledSize: new window.google.maps.Size(32, 32) }}
                onClick={() => setSelectedMarker(point)}
                zIndex={3}
              />
            ))}
            
            {/* Helper's location */}
            {showHelperLocation && helperLocation && (
              <Marker 
                position={helperLocation}
                icon={{ url: helperIcon, scaledSize: new window.google.maps.Size(32, 32) }}
                zIndex={4}
                onClick={() => setSelectedHelper(helperLocation)}
              />
            )}
            
            {/* Directions from helper to victim */}
            {directions && (
              <DirectionsRenderer
                options={{
                  directions,
                  polylineOptions: {
                    strokeColor: "#4285F4",
                    strokeOpacity: 0.8,
                    strokeWeight: 5,
                    zIndex: 5
                  },
                  suppressMarkers: true
                }}
              />
            )}
            
            {/* Info window for selected victim marker */}
            {selectedMarker && (
              <InfoWindow
                position={{ lat: selectedMarker.latitude, lng: selectedMarker.longitude }}
                options={{
                  disableAutoPan: true,
                  pixelOffset: new window.google.maps.Size(0, -30),
                }}
              >
                <div>
                  <p className="font-bold">Victim Location</p>
                  <p>{new Date(selectedMarker.timestamp || selectedMarker.endTime).toLocaleString()}</p>
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
        `}
      </style>
      </LoadScript>
      
    </>
  );
}

export default EmergencyMap;