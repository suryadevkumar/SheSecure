import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import { startShareLocation, stopShareLocation } from "../redux/liveLocationSlice";
import io from 'socket.io-client';
import { toast } from "react-toastify";
import { wsUrl } from "../config/config";

const LOCATION_STORAGE_KEY = 'active_location_data';

const useLiveLocation = () => {
  const dispatch = useDispatch();
  const [shareId, setShareId] = useState(null);
  const [socket, setSocket] = useState(null);

  const { latitude, longitude } = useSelector((state) => state.location);
  const isLocationShared = useSelector((state) => state.liveLocation.isLocationShared);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(wsUrl+"/location");
    setSocket(newSocket);

    // Check localStorage for active session on mount
    const checkForActiveSharing = () => {
      const savedData = localStorage.getItem(LOCATION_STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setShareId(parsedData.shareId);
        dispatch(startShareLocation());
        
        // Re-join the room
        if (newSocket) {
          newSocket.emit("location:join", parsedData.shareId);
        }
      }
    };
    
    checkForActiveSharing();

    return () => {
      newSocket.disconnect();
    };
  }, [dispatch]);

  // Send location updates
  useEffect(() => {
    if (socket && shareId && latitude && longitude && isLocationShared) {
      socket.emit("location:update", {
        shareId,
        latitude,
        longitude,
        timestamp: Date.now()
      });
    }
  }, [socket, shareId, latitude, longitude, isLocationShared]);

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;
    
    const handleError = (error) => {
      console.error("Socket error:", error);
    };
    
    const handleSessionEnded = (data) => {
      console.log("Session ended:", data);
      dispatch(stopShareLocation());
      setShareId(null);
      localStorage.removeItem(LOCATION_STORAGE_KEY);
    };
    
    socket.on("error", handleError);
    socket.on("location:session_ended", handleSessionEnded);
    
    return () => {
      socket.off("error", handleError);
      socket.off("location:session_ended", handleSessionEnded);
    };
  }, [socket, dispatch]);

  // Start sharing location
  const startSharing = useCallback(async () => {
    if (!latitude || !longitude) {
      console.log("Cannot share location: Location not available");
      return null;
    }

    try {
      const newShareId = uuidv4();
      setShareId(newShareId);

      // Save to localStorage
      localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify({
        shareId: newShareId,
      }));

      // Join the location sharing room
      socket.emit("location:join", newShareId, (response) => {
        if (!response?.success) {
          throw new Error(response?.message || "Failed to join location room");
        }
      });

      // Send initial location
      socket.emit("location:update", {
        shareId: newShareId,
        latitude,
        longitude,
        timestamp: Date.now()
      });

      dispatch(startShareLocation());

      return newShareId;
    } catch (err) {
      console.error("Start sharing error:", err);
      return null;
    }
  }, [dispatch, socket, latitude, longitude]);

  // Stop sharing location
  const stopSharing = useCallback(async () => {
    if (!shareId) return;

    try {
      // Explicitly end the session
      socket.emit("location:end_session", shareId, (response) => {
        if (!response?.success) {
          console.error("Failed to end location session:", response?.message);
        }
      });
      
      // Clear localStorage
      localStorage.removeItem(LOCATION_STORAGE_KEY);
      
      // Update Redux state
      dispatch(stopShareLocation());
      
      // Clear local state
      setShareId(null);
      
      toast.error("Location sharing has been stopped");
    } catch (err) {
      console.error("Stop sharing error:", err);
    }
  }, [dispatch, socket, shareId]);

  return {
    startShareLocation: startSharing,
    stopShareLocation: stopSharing,
  };
};

export default useLiveLocation;