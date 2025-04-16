import { api } from "../config/config";

// Approve Admin
export const approveAdmin = async (token, userId) => {
    try {
        const response = await fetch(`${api}/superAdmin/approve/${userId}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) throw new Error('Failed to approve admin');
        return await response.json();
    } catch (err) {
        console.error('Error approving admin:', err);
        throw err;
    }
};

// Reject Admin
export const rejectAdmin = async (token, userId) => {
    try {
        const response = await fetch(`${api}/superAdmin/reject/${userId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) throw new Error('Failed to reject admin');
        return await response.json();
    } catch (err) {
        console.error('Error rejecting admin:', err);
        throw err;
    }
};
