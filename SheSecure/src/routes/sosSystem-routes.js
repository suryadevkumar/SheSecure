import { useSelector } from "react-redux";
import { api } from "../config/config";

export const saveSOS = async(newReportId, latitude, longitude)=>{
    const token = useSelector((state) => state.auth.token);
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
        }),
    });
    return response;
}

export const endSOS = async(reportId)=>{
    const token = useSelector((state) => state.auth.token);
    const response = await fetch(api + "/sos/end-sos", {
        method: "POST",
        headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reportId }),
    });
    return response;
}