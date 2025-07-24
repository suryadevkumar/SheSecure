import axios from 'axios';
import { api } from "../config/config";

export const submitCrimeReport = async (token, formData, onProgress) => {
    try {
        const response = await fetch(api + '/crime/report-crime', {
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

export const fetchReports = async (token, userType) => {
    try {
        let response;
        if (userType === 'User') {
            response = await axios.get('/api/crime/my-reports', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
        }
        else if (userType === 'Admin') {
            response = await axios.get('/api/crime/getAllReports', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
        }

        console.log(response.data);

        return { success: true, data: response.data.reports };
    } catch (err) {
        console.error('Error fetching reports:', err);
        return {
            success: false,
            error: err.response?.data?.message || 'Failed to fetch reports',
            details: err
        };
    }
};

export const crimeReportVerify = async (token, reportId) => {
    try {
        console.log(token)
        const response = await axios.put(`/api/crime/verify-report/${reportId}`, {}, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log(response);
        if (response.data.success)
            return { success: true, message: response.data.message };
        else
            return { success: false, message: response.data.message };
    } catch (err) {
        console.error('Crime verification failed:', err);
        return { success: false, message: err.response?.data?.message || err.message };
    }
};

export const crimeReportRemove = async (token, reportId) => {
    try {
        const response = await axios.delete(`/api/crime/remove-report/${reportId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        if (response.data.success)
            return { success: true, message: response.data.message };
        else
            return { success: false, message: response.data.message };
    } catch (err) {
        console.error('Crime deletion failed:', err);
        return { success: false, message: err.response?.data?.message || err.message };
    }
};

export const crimeReportsNearMe = async (token, latitude, longitude) => {
    try {
        const response = await axios.post(
            '/api/crime/get-crimes-near-me',
            { latitude, longitude },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (response.data.success) {
            return response.data;
        } else {
            return { success: false, message: response.data.message };
        }
    } catch (err) {
        console.error('Crime location fetch failed:', err);
        return {
            success: false,
            message: err.response?.data?.message || err.message
        };
    }
};
