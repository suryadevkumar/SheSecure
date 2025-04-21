import axios from 'axios';

export const crimeInteraction = async (token) => {
    try {
        const response = await axios.get('/api/crimeInteraction/stats', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return { success: true, data: response?.data || [] };
    } catch (err) {
        console.error('Crime interaction fetch failed:', err);
        return { success: false, error: err.response?.data?.message || 'Failed to fetch crime interactions' };
    }
};

export const getInteractions = async (token, crimeId) => {
    try {
        const response = await axios.get(`/api/crimeInteraction/crime-interaction/${crimeId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return { success: true, data: response.data };
    } catch (error) {
        console.error("Error fetching interactions:", error);
        return { success: false, error: error.response?.data?.message || 'Failed to fetch interactions' };
    }
};

export const interactWithCrime = async (token, crimeId, action) => {
    try {
        const response = await axios.post(
            `/api/crimeInteraction/${crimeId}/interact`,
            { supportStatus: action },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );
        return { success: true, data: response.data };
    } catch (error) {
        console.error("Error updating interaction:", error);
        return { success: false, error: error.response?.data?.message || 'Failed to update interaction' };
    }
};

export const crimeComment = async (token, crimeId, comment) => {
    try {
        const response = await axios.post(
            `/api/crimeInteraction/${crimeId}/comment`,
            { comment: comment.trim() },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );
        return { success: true, data: response.data };
    } catch (error) {
        console.error("Error posting comment:", error);
        return { success: false, error: error.response?.data?.message || 'Failed to post comment' };
    }
};