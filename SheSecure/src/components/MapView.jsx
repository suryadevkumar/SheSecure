import React, { useState, useEffect, useMemo } from "react";
import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";
import { googleMapAPI } from "../config/config";
import getLocation from "../utils/Location";

const MapShow = () => {
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: googleMapAPI,
  });

  const mapContainerStyle = {
    width: "100%",
    height: "1000px",
  };

  const center = useMemo(() => location, [location]);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const currentLocation = await getLocation();
        setLocation(currentLocation);
      } catch (error) {
        setLocationError(error);
        console.error("Error getting location:", error);
      }
    };

    fetchLocation();
  }, []);

  if (loadError) return <div>Error loading maps!</div>;
  if (!isLoaded) return <div>Loading Maps...</div>;
  if (locationError) return <div>Error: {locationError.message}</div>;
  if (!location) return <div>Getting your location...</div>;

  return (
    <GoogleMap mapContainerStyle={mapContainerStyle} center={center} zoom={15}>
      {location && <Marker position={location} />}
    </GoogleMap>
  );
};

export default MapShow;