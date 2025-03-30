import React, { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { googleMapAPI } from '../config/config';
import { api } from '../config/config';

const LiveLocationMap = ({ reportId }) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: googleMapAPI,
  });

  const mapStyles = {
    height: '100%',
    width: '100%',
  };

  const fetchLocation = async () => {
    try {
      const response = await fetch(api+`/sos/get-live-location?reportId=${reportId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch location');
      }
      const data = await response.json();
      setLocation({ lat: data.latitude, lng: data.longitude });
    } catch (err) {
      setError(err.message);
      console.error('Error fetching location:', err);
    }
  };

  useEffect(() => {
    fetchLocation();
    const intervalId = setInterval(fetchLocation, 5000);

    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, [reportId]);

  if (!isLoaded) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!location) return <div>Loading Location...</div>;

  return (
    <GoogleMap mapContainerStyle={mapStyles} zoom={15} center={location}>
      <Marker position={location} />
    </GoogleMap>
  );
};

export default LiveLocationMap;


// import React, { useEffect, useState } from "react";
// import useFetchLocation from "./useFetchLocation";

// const MyComponent = ({ reportId }) => {
//   const { locationData: initialLocationData, isSOSActive } = useFetchLocation(reportId); // Fetch initially
//   const [locationData, setLocationData] = useState(initialLocationData);

//   useEffect(() => {
//     const fetchLocation = async () => {
//       const { locationData: newLocationData } = useFetchLocation(reportId);
//       setLocationData(newLocationData);
//     };

//     const intervalId = setInterval(() => {
//       console.log("Fetching location data...");
//       fetchLocation(); // Manually trigger fetching inside the interval
//     }, 5000); // 5-second interval (can be adjusted)

//     // Cleanup interval when the component unmounts
//     return () => clearInterval(intervalId);
//   }, [reportId]);

//   return (
//     <div>
//       {isSOSActive ? <h1>Live Location</h1> : <h1>Location History (5 hours)</h1>}
//       <pre>{JSON.stringify(locationData, null, 2)}</pre>
//     </div>
//   );
// };

// export default MyComponent;
