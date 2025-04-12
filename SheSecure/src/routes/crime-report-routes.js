import { api } from "../config/config";

export const submitCrimeReport = async (token, formData, onProgress) => {
    try {
        const response = await fetch(api+'/crime/report-crime', {
            method: 'POST',
            body: formData,
            headers: {
                Authorization: `Bearer ${token}`
            },
            // Include this if you want to track upload progress
            onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round(
                    (progressEvent.loaded * 100) / progressEvent.total
                );
                if (onProgress) onProgress(percentCompleted);
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to submit report');
        }

        return await response.json();
    } catch (error) {
        console.error("Error in API call:", error);
        throw error;
    }
};