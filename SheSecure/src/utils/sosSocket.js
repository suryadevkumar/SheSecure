import { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { useSelector, useDispatch } from "react-redux";
import { startSOSAction, stopSOSAction } from "../redux/sosSlice";
import io from 'socket.io-client';
import { endSOS, saveSOS, checkActiveSOS } from "../routes/sosSystem-routes";

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
    const newSocket = io("http://localhost:3000/sos");
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

  // Listen for socket disconnection and reconnection
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
    
    socket.on("disconnect", handleDisconnect);
    socket.on("connect", handleReconnect);
    
    return () => {
      socket.off("disconnect", handleDisconnect);
      socket.off("connect", handleReconnect);
    };
  }, [socket, reportId, isSOSActive]);

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
      const newReportId = `${uuidv4()}_${uuidv4()}`;
      const response = await saveSOS(token, newReportId, latitude, longitude, user._id);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to start SOS');
      }

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

      // Show the SOS link to the user
      console.log(`SOS Activated! Share this link: ${data.link}`);

      return data.link;
    } catch (err) {
      setError(err.message || "Error starting SOS");
      console.error("Start SOS error:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, socket, latitude, longitude, token]);

  const stopSOS = useCallback(async () => {
    if (!reportId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await endSOS(reportId, token, user._id);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to end SOS');
      }

      // Leave the socket room
      socket.emit("leaveSOS", reportId);

      // Clear localStorage
      localStorage.removeItem(SOS_STORAGE_KEY);

      // Update Redux state
      dispatch(stopSOSAction());

      // Clear local state
      setReportId(null);
      setSosLink('');

      alert("SOS has been deactivated");
    } catch (err) {
      setError(err.message || "Error stopping SOS");
      console.error("Stop SOS error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, socket, reportId, token]);

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