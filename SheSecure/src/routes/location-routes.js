import { api } from "../config/config";


export const sendLocationToBackend = async (lat, lng, startTime, endTime, token, userId) => {
    if (!token) return;
    try {
        const response = await fetch(api + '/location/save-userLocation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                latitude: lat,
                longitude: lng,
                startTime: startTime,
                endTime: endTime,
                userId: userId
            }),
        });

        if (!response.ok) {
            console.error('Error sending location history to backend', await response.text());
        }
    } catch (err) {
        console.error('Failed to send location history:', err);
    }
};