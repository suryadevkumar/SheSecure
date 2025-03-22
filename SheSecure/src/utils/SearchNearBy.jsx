import { googleMapAPI } from '../config/config';

const searchNearby = async (lat, lng, type) => {
  try {
    const apiKey = googleMapAPI;
    const url = `https://places.googleapis.com/v1/places:searchNearby`;

    const requestBody = {
      includedTypes: [type],
      locationRestriction: {
        circle: {
          center: {
            latitude: lat,
            longitude: lng,
          },
          radius: 5000,
        },
      },
    };

    const jsonBody = JSON.stringify(requestBody);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location.latitude,places.location.longitude',
      },
      body: jsonBody,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.places || [];
  } catch (err) {
    console.error('Error in searchNearby:', err);
    throw err;
  }
};

export default searchNearby;