import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useSelector, useDispatch } from "react-redux";
import { api } from "../config/config";
import {
  startSOSAction,
  stopSOSAction,
  setErrorSOSAction,
} from "../redux/sosSlice";

const useSOSSystem = () => {
  const dispatch = useDispatch();
  const { reportId, sosLink, errorSOS, isSOSActive } = useSelector(
    (state) => state.sos
  );
  const {
    latitude,
    longitude,
    error: locationError,
  } = useSelector((state) => state.location);

  const startSOS = async () => {
    try {
      const newReportId = uuidv4();
      const newSosLink = `http://localhost:5173/emergencyMap/?reportId=${newReportId}`;
      console.log(newReportId);
      console.log(newSosLink);

      dispatch(startSOSAction({ reportId: newReportId, sosLink: newSosLink }));

      const response = await fetch(api + "/sos/start-sos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reportId: newReportId }),
      });

      if (!response.ok) {
        throw new Error("Failed to start SOS");
      }

      if (latitude && longitude) {
        sendLocation(newReportId, latitude, longitude);
      }
    } catch (err) {
      dispatch(setErrorSOSAction(err.message));
      dispatch(stopSOSAction());
      console.error("SOS error:", err);
    }
  };

  const stopSOS = async () => {
    try {
      dispatch(stopSOSAction());
    } catch (err) {
      dispatch(setErrorSOSAction(err.message));
      console.error("Error stopping SOS", err);
    }
  };

  const sendLocation = async (currentReportId, lat, lon) => {
    try {
      await fetch(api + "/sos/update-location", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reportId: currentReportId,
          latitude: lat,
          longitude: lon,
        }),
      });
      console.log("Location updated successfully");
    } catch (err) {
      dispatch(setErrorSOSAction(err.message));
      console.error("Location update error:", err);
    }
  };

  useEffect(() => {
    if (isSOSActive && latitude && longitude) {
      sendLocation(reportId, latitude, longitude);
    }
  }, [isSOSActive, latitude, longitude, reportId]);

  return {
    reportId,
    sosLink,
    errorSOS,
    isSOSActive,
    locationError,
    startSOS,
    stopSOS,
  };
};

export default useSOSSystem;
