import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useSelector, useDispatch } from "react-redux";
import { startSOSAction, stopSOSAction } from "../redux/sosSlice";
import { api } from "../config/config";
import io from 'socket.io-client';

export const useSOSSystem = () => {
  const dispatch = useDispatch();
  const [reportId, setReportId] = useState(null);
  const [socket, setSocket] = useState(null);
  const token = useSelector((state) => state.auth.token);
  const { latitude, longitude } = useSelector((state) => state.location);
  const [sosLink, setSosLink] = useState('');

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io("http://localhost:3000");
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Send location updates when they change
  useEffect(() => {
    if (socket && reportId && latitude && longitude) {
      socket.emit("updateLocation", {
        reportId,
        latitude,
        longitude
      });
    }
  }, [socket, reportId, latitude, longitude]);

  const startSOS = async () => {
    try {
      const newReportId = `${uuidv4()}_${uuidv4()}`;
      setReportId(newReportId);
      
      const link = `${window.location.origin}/emergency-sos/?reportId=${newReportId}`;
      setSosLink(link);
      console.log(link);

      dispatch(startSOSAction());

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

      if (!response.ok) {
        throw new Error('Failed to start SOS');
      }

      // Join the SOS room
      socket.emit("joinSOS", newReportId);

      return link;
    } catch (err) {
      console.error("Start SOS error:", err);
      setReportId(null);
      setSosLink('');
      throw err;
    }
  };

  const stopSOS = async () => {
    if (!reportId) return;

    try {
      const response = await fetch(api + "/sos/end-sos", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reportId }),
      });

      if (!response.ok) {
        throw new Error('Failed to end SOS');
      }

      socket.emit("leaveSOS", reportId);
      dispatch(stopSOSAction());
      setReportId(null);
      setSosLink('');
    } catch (err) {
      console.error("Error stopping SOS", err);
      throw err;
    }
  };

  return {
    startSOS,
    stopSOS,
    sosLink,
    isActive: !!reportId,
    reportId
  };
};