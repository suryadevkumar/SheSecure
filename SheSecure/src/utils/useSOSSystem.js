import { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { useSelector, useDispatch } from "react-redux";
import { startSOSAction, stopSOSAction } from "../redux/sosSlice";
import io from 'socket.io-client';
import { endSOS, saveSOS, checkActiveSOS, sendLink } from "../routes/sosSystem-routes";
import { getEmergencyContacts } from "../routes/emergency-contact-routes";
import { wsUrl } from "../config/config";

const SOS_STORAGE_KEY = 'active_sos_data';

const useSosSocket = () => {
  const dispatch = useDispatch();
  const [reportId, setReportId] = useState(null);
  const [socket, setSocket] = useState(null);
  const [sosLink, setSosLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { latitude, longitude } = useSelector((state) => state.location);
  const token = useSelector((state) => state.auth.token);
  const isSOSActive = useSelector((state) => state.sos.isSOSActive);
  const user = useSelector((state) => state.auth.user);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(wsUrl+"/sos");
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Check for active SOS when component mounts or user logs in
  useEffect(() => {
    const checkForActiveSOS = async () => {
      if (!token || !user) return;

      try {
        // First check localStorage for any saved SOS data
        const savedSOSData = localStorage.getItem(SOS_STORAGE_KEY);
        if (savedSOSData) {
          const parsedData = JSON.parse(savedSOSData);
          setReportId(parsedData.reportId);
          setSosLink(parsedData.sosLink);
          dispatch(startSOSAction());

          // Join the SOS room
          if (socket) {
            socket.emit("joinSOS", parsedData.reportId);
          }
        } else {
          // If nothing in localStorage, check with the server
          const response = await checkActiveSOS(token, user._id);

          if (!response.ok) {
            throw new Error(`Failed to fetch active SOS. Status: ${response.status}`);
          }

          const data = await response.json();

          if (response.ok && data.isActive) {
            setReportId(data.reportId);
            setSosLink(data.sosLink);
            dispatch(startSOSAction());

            // Save to localStorage
            localStorage.setItem(SOS_STORAGE_KEY, JSON.stringify({
              reportId: data.reportId,
              sosLink: data.sosLink
            }));

            // Join the SOS room
            if (socket) {
              socket.emit("joinSOS", data.reportId);
            }
          }
        }
      } catch (err) {
        console.error("Error checking active SOS:", err);
      }
    };

    checkForActiveSOS();
  }, [token, user, socket, dispatch]);

  // Send location updates when they change
  useEffect(() => {
    if (socket && reportId && latitude && longitude && isSOSActive) {
      socket.emit("updateLocation", {
        reportId,
        latitude,
        longitude
      });
    }
  }, [socket, reportId, latitude, longitude, isSOSActive]);

  // Listen for socket events
  useEffect(() => {
    if (!socket) return;

    const handleDisconnect = () => {
      console.log("Socket disconnected");
    };

    const handleReconnect = () => {
      console.log("Socket reconnected");
      // Re-join the SOS room if active
      if (reportId && isSOSActive) {
        socket.emit("joinSOS", reportId);
      }
    };

    const handleStatusUpdate = (data) => {
      console.log("SOS status update:", data);
      if (data.status === "inactive") {
        // SOS was deactivated elsewhere
        dispatch(stopSOSAction());
        localStorage.removeItem(SOS_STORAGE_KEY);
        // Don't clear reportId and sosLink to keep history accessible
      }
    };

    socket.on("disconnect", handleDisconnect);
    socket.on("connect", handleReconnect);
    socket.on("statusUpdate", handleStatusUpdate);

    return () => {
      socket.off("disconnect", handleDisconnect);
      socket.off("connect", handleReconnect);
      socket.off("statusUpdate", handleStatusUpdate);
    };
  }, [socket, reportId, isSOSActive, dispatch]);

  // Ping the server periodically to keep the SOS session alive
  useEffect(() => {
    let interval;

    if (isSOSActive && reportId && socket) {
      interval = setInterval(() => {
        socket.emit("keepAlive", { reportId });
      }, 30000); // Every 30 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSOSActive, reportId, socket]);

  const startSOS = useCallback(async () => {
    if (!latitude || !longitude) {
      setError("Cannot start SOS: Location not available");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const newReportId = uuidv4();
      const response = await saveSOS(token, newReportId, latitude, longitude, user._id);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to start SOS');
      }

      const data = await response.json();

      setReportId(newReportId);
      setSosLink(data.link);

      // Save to localStorage
      localStorage.setItem(SOS_STORAGE_KEY, JSON.stringify({
        reportId: newReportId,
        sosLink: data.link
      }));

      // Join the SOS room
      socket.emit("joinSOS", newReportId);

      // Update Redux state
      dispatch(startSOSAction());

      const result = await getEmergencyContacts(token);
      if (result.success && result.contacts && result.contacts.length) {
        const contactNumbers = result?.contacts.map(c => c.contactNumber);
          sendLink(contactNumbers, "SOS", newReportId, token);
      }

      return data.link;
    } catch (err) {
      setError(err.message || "Error starting SOS");
      console.error("Start SOS error:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, socket, latitude, longitude, token, user?._id]);

  const stopSOS = useCallback(async () => {
    if (!reportId) return;

    setIsLoading(true);
    setError(null);

    try {
      // First emit the socket event for immediate update to all clients
      if (socket && reportId) {
        socket.emit("endSOS", { reportId });
      }

      // Then update the database
      const response = await endSOS(reportId, token, user._id);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to end SOS');
      }

      // Clear localStorage
      localStorage.removeItem(SOS_STORAGE_KEY);

      // Update Redux state
      dispatch(stopSOSAction());

      // No need for alert - notification will come from socket
      console.log("SOS has been deactivated");
    } catch (err) {
      setError(err.message || "Error stopping SOS");
      console.error("Stop SOS error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, socket, reportId, token, user?._id])

  return {
    startSOS,
    stopSOS,
    sosLink,
    isActive: isSOSActive,
    reportId,
    isLoading,
    error
  };
};

export default useSosSocket;