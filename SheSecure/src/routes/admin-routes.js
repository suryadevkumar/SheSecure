import { toast } from "react-toastify";
import { api } from "../config/config";

export const fetchAllUser = async (token) => {
    try {
        const response = await fetch(api + '/auth/allUsers', {
            method: 'GET',
            credentials: 'include',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.ok) {
            const data = await response.json();
            return data.allUsers || [];
        } else {
            toast.error('All Users fetching Failed.');
        }
    } catch (err) {
        console.error('allUser Error:', err);
        toast.error(err);
        throw err;
    }
};

export const approveCounsellor = async (token, userId) => {
    try {
        if (!token) throw new Error('Authentication token missing');

        const response = await fetch(`${api}/admin/approve/${userId}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to approve counsellor');
        return data;
    } catch (error) {
        console.error('Approval error:', error);
        throw error;
    }
};

export const rejectCounsellor = async (token, userId) => {
    try {
        if (!token) throw new Error('Authentication token missing');

        const response = await fetch(`${api}/admin/reject/${userId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to reject counsellor');
        return data;
    } catch (error) {
        console.error('Rejection error:', error);
        throw error;
    }
};