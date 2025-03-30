import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useSelector, useDispatch } from "react-redux";
import { startSOSAction, stopSOSAction } from "../redux/sosSlice";
import { api } from "../config/config";

export const useSOSSystem = () => {
  const dispatch = useDispatch();
  const [reportId, setReportId] = useState(null);
  const token = useSelector((state) => state.auth.token);
  const { latitude, longitude, error: locationError } = useSelector((state) => state.location);

  const startSOS = async () => {
    try {
      const reportId1 = uuidv4();
      const reportId2 = uuidv4();
      const reportId = `${reportId1}_${reportId2}`;
      setReportId(reportId);
      const newSosLink = `http://localhost:5173/emergencyMap/?reportId=${reportId}`;
      console.log(newSosLink);

      dispatch(startSOSAction());
      if(reportId && latitude && longitude){
        await fetch(api + "/sos/start-sos", {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            reportId: reportId,
            latitude: latitude,
            longitude: longitude,
          }),
        });
      }
      else
      console.error("Report id, Latitude, Longitude missing");
    } catch (err) {
      console.error("Start SOS error:", err);
    }
  };

  const stopSOS = async () => {
    try {
      if (reportId) {
        await fetch(api + "/sos/end-sos", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reportId: reportId
          }),
        });
        dispatch(stopSOSAction());
        setReportId(null);
      } else {
        console.error("No reportId found to stop SOS");
      }
    } catch (err) {
      console.error("Error stopping SOS", err);
    }
  };

  return {
    locationError,
    startSOS,
    stopSOS,
  };
};

export const useFetchLocation = (reportId) => {
  const [locationData, setLocationData] = useState(null);
  const [isSOSActive, setIsSOSActive] = useState(null);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        // Check SOS status
        const response = await fetch(`/sos/check-status/${reportId}`);
        const data = await response.json();

        if (!response.ok) {
          console.error(data.message);
          return;
        }

        // If SOS is active, fetch live location
        if (data.isActive) {
          const liveResponse = await fetch(`/sos/live-location/${reportId}`);
          const liveData = await liveResponse.json();

          if (liveResponse.ok) {
            setLocationData(liveData.locationHistory);
            setIsSOSActive(true);
          } else {
            console.error(liveData.message);
          }
        } 
        // If SOS is deactivated, fetch location history
        else {
          const historyResponse = await fetch(`/sos/history-location/${reportId}`);
          const historyData = await historyResponse.json();

          if (historyResponse.ok) {
            setLocationData(historyData.locationHistory);
            setIsSOSActive(false);
          } else {
            console.error(historyData.message);
          }
        }
      } catch (error) {
        console.error("Failed to fetch location data:", error);
      }
    };

    fetchLocation();
  }, [reportId]);

  return { locationData, isSOSActive };
};
