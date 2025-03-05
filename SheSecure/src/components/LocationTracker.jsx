import React, { useState, useEffect } from 'react';
import ViewMap from './ViewMap';

const LocationTracker=()=> {
    const [location, setLocation] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
    if (!navigator.geolocation) {
        setError('Geolocation is not supported by your browser.');
        return;
    }

    const watchId = navigator.geolocation.watchPosition(
        (position) => {
        setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
        });
        },
        (error) => {
        setError(error.message);
        }
    );

    return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    if (error) {
    return <div>Error: {error}</div>;
    }

    if (!location) {
    return <div>Loading location...</div>;
    }

    return (
    <div>
        <p className='text-3xl text-center text-blue-600'>Latitude: {location.latitude} <br /> Longitude: {location.longitude}</p>
        <ViewMap latitude={location.latitude} longitude={location.longitude}/>
    </div>
    );
}

export default LocationTracker;