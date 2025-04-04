import { useSelector } from "react-redux";
import { api } from "../config/config";


export const sendLocationToBackend = async (lat, lng, startTime, endTime) => {
    const token = useSelector((state) => state.auth.token);
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
            }),
        });

        if (!response.ok) {
            console.error('Error sending location history to backend', await response.text());
        }
    } catch (err) {
        console.error('Failed to send location history:', err);
    }
};