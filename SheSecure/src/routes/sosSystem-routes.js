import { api } from "../config/config";

export const saveSOS = async (token, newReportId, latitude, longitude, userId) => {
    const response = await fetch(api + "/sos/start-sos", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            reportId: newReportId,
            latitude,
            longitude,
            userId
        }),
    });
    return response;
};

export const endSOS = async (reportId, token) => {
    const response = await fetch(api + "/sos/end-sos", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reportId }),
    });
    return response;
};

export const checkActiveSOS = async (token, userId) => {
    const response = await fetch(api + "/sos/check-active", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
    });
    return response;
};

export const keepAlive = async (reportId) => {
    const response = await fetch(api + "/sos/keep-alive", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reportId }),
    });
    return response;
};

export const sendLink = async (contacts, link_type, link_id, token) => {
    const origin = window.location.origin;
    await fetch(api + "/sos/send-link", {
        method: "POST",
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ contacts, link_type, origin, link_id }),
    });
};

