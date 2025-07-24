import axios from 'axios';
import { api, googleMapAPI } from "../config/config";

const getPlaceDetails = async (lat, lng) => {
    const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleMapAPI}`
    );
    const data = await res.json();

    if (data.status === "OK") {
        const result = data.results[0];
        return {
            displayName: result.address_components[0]?.long_name || "Unknown",
            formattedAddress: result.formatted_address,
        };
    }

    return {
        displayName: "Unknown",
        formattedAddress: "Unknown",
    };
};

export const sendLocationToBackend = async (lat, lng, startTime, endTime, token) => {
    if (!token) return;
    try {
        const { displayName, formattedAddress } = await getPlaceDetails(lat, lng);
        const response = await fetch(api + '/location/save-userLocation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                latitude: lat,
                longitude: lng,
                displayName: displayName,
                formattedAddress: formattedAddress,
                startTime: startTime,
                endTime: endTime
            }),
        });

        if (!response.ok) {
            console.error('Error sending location history to backend', await response.text());
        }
    } catch (err) {
        console.error('Failed to send location history:', err);
    }
};

export const fetchLocationHistory = async (date, token) => {
  try {
    const response = await axios.get(`/api/location/location-history?date=${date}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const locationData = response.data?.data || [];

    if (locationData.length > 0) {
      return { success: true, data: locationData };
    } else {
      return { success: true, data: [] };
    }
  } catch (err) {
    console.error('Failed to fetch location data:', err);
    return {
      success: false,
      error: 'Failed to fetch location history. Please try again.',
      details: err
    };
  }
};
