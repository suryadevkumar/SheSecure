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

// API calling function (separate from component)
export const submitContactForm = async (formData) => {
    try {
        const response = await fetch(`${api}/superadmin/contactUs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to send message');
        }

        return await response.json();
    } catch (error) {
        console.error('Error submitting contact form:', error);
        throw error; // Re-throw to be caught in the component
    }
};