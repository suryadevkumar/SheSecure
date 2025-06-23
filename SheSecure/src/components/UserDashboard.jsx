import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import useLiveLocation from "../utils/useLiveLocation";
import {
  FaShieldAlt,
  FaUserFriends,
  FaBell,
  FaMapMarkerAlt,
  FaFirstAid,
  FaPhoneAlt,
  FaTaxi,
  FaExternalLinkAlt,
  FaLocationArrow,
} from "react-icons/fa";
import { MdSecurity, MdLocalPolice, MdLocalHospital } from "react-icons/md";
import { MinimalMapView } from "./MapView";
import ContactSelector from "./ContactSelector";
import useSosSocket from "../utils/useSOSSystem";
import { useState } from "react";

const UserDashboard = () => {
  const navigate = useNavigate();
  const { startSOS, stopSOS } = useSosSocket();

  const {
    startShareLocation,
    stopShareLocation,
  } = useLiveLocation();

  const [showContactSelector, setShowContactSelector] = useState(false);
  const [tempLocationId, setTempLocationId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Redux data for location, crime, police stations and hospitals
  const crimesData = useSelector((state) => state.crime.crimeReports);
  const policeStations = useSelector((state) => state.police.policeStations);
  const hospitals = useSelector((state) => state.hospital.hospitals);
  const isSOSActive = useSelector((state) => state.sos.isSOSActive);
  const isLocationShared = useSelector((state) => state.liveLocation.isLocationShared);

  // Find the nearest crime and its distance
  const nearestCrime =
    crimesData && crimesData.length > 0 ? crimesData[0] : null;
  const nearestCrimeDistance = nearestCrime ? nearestCrime.distance : null;

  const handleClick = async () => {
    if (!isLocationShared) {
      try {
        setIsLoading(true);
        const location_id = await startShareLocation();
        setTempLocationId(location_id);
        setShowContactSelector(true);
      } catch (err) {
        console.error("Error starting location sharing:", err);
      } finally {
        setIsLoading(false);
      }
    } else {
      await stopShareLocation();
      console.log("Location sharing stopped");
    }
  };

  const handleContactSelectionComplete = (success) => {
    setShowContactSelector(false);
    if (!success) {
      // User cancelled or didn't select any contacts
      stopShareLocation();
      setTempLocationId(null);
    }
  };

  // Calculate safety score based on nearest crime distance
  // If no crimes, score is 100
  // If crime is very close (0.1km or less), score is low (10)
  // If crime is far (5km or more), score is high (90)
  const calculateSafetyScore = () => {
    if (!nearestCrimeDistance) return 100;

    // Scale: 0.1km -> 10 points, 5km -> 90 points
    const score = Math.min(
      90,
      Math.max(10, (nearestCrimeDistance / 5) * 80 + 10)
    );
    return Math.round(score);
  };

  const safetyScore = calculateSafetyScore();

  // Get gradient colors based on safety score
  const getGradientColors = () => {
    if (safetyScore >= 80) {
      return "from-green-500 to-teal-600";
    } else if (safetyScore >= 60) {
      return "from-green-500 to-yellow-500";
    } else if (safetyScore >= 40) {
      return "from-yellow-500 to-orange-500";
    } else if (safetyScore >= 20) {
      return "from-orange-500 to-red-500";
    } else {
      return "from-red-500 to-pink-600";
    }
  };

  // Get safety status message
  const getSafetyMessage = () => {
    if (safetyScore >= 80) {
      return "You're in a safe area";
    } else if (safetyScore >= 60) {
      return "Generally safe area, stay alert";
    } else if (safetyScore >= 40) {
      return "Be cautious in this area";
    } else if (safetyScore >= 20) {
      return "Increased risk in this area - be vigilant";
    } else {
      return "High risk area - stay alert";
    }
  };

  const handleServiceClick = (service) => {
    navigate("/map-view", { state: { selectedService: service } });
  };

  return (
    <div className="p-4 lg:mb-8 sm:mb-24 md:p-6 space-y-8 max-w-6xl mx-auto">
      <div className="w-full space-y-8">
        {/* Safety Status Banner */}
        <div
          className={`rounded-2xl p-6 shadow-lg text-white bg-gradient-to-r ${getGradientColors()}`}
        >
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <FaShieldAlt className="text-yellow-300" /> Safety Status
              </h2>
              <p className="mt-2">
                {getSafetyMessage()}
                {crimesData?.length > 0 &&
                  ` (${crimesData.length} crime${
                    crimesData.length !== 1 ? "s" : ""
                  } reported nearby)`}
              </p>
              {nearestCrimeDistance !== null && (
                <p className="mt-1 text-sm text-white/90">
                  Nearest incident: {nearestCrimeDistance.toFixed(1)} km away •{" "}
                  {nearestCrime.typeOfCrime}
                </p>
              )}
            </div>
            <div className="mt-4 md:mt-0 text-center">
              <div className="text-4xl font-bold">{safetyScore}/100</div>
              <div className="text-sm opacity-80">Safety Score</div>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/emergency-contacts"
            className="bg-white p-4 rounded-xl shadow-md flex flex-col items-center justify-center text-center hover:bg-purple-50 transition-colors cursor-pointer"
          >
            <div className="bg-purple-100 p-3 rounded-full mb-2">
              <FaUserFriends className="text-purple-600 text-xl" />
            </div>
            <span className="font-medium">Trusted Contacts</span>
          </Link>

          <button
            onClick={isSOSActive ? stopSOS : startSOS}
            className={`p-4 rounded-xl shadow-md flex flex-col items-center justify-center text-center transition-colors cursor-pointer ${
              isSOSActive ? "bg-red-600 text-white" : "bg-white hover:bg-red-50"
            }`}
          >
            <div
              className={`p-3 rounded-full mb-2 ${
                isSOSActive ? "bg-red-700" : "bg-red-100"
              }`}
            >
              <FaBell
                className={`text-xl ${
                  isSOSActive ? "text-white" : "text-red-600"
                }`}
              />
            </div>
            <span className="font-medium">Emergency SOS</span>
          </button>

          <button
            onClick={handleClick}
            disabled={isLoading}
            className={`p-4 rounded-xl shadow-md flex flex-col items-center justify-center text-center transition-colors cursor-pointer ${
              isLocationShared
                ? "bg-blue-600 text-white"
                : "bg-white hover:bg-blue-50"
            }`}
          >
            <div
              className={`p-3 rounded-full mb-2 ${
                isLocationShared ? "bg-blue-700" : "bg-blue-100"
              }`}
            >
              <FaLocationArrow
                className={`text-xl ${
                  isLocationShared ? "text-white" : "text-blue-600"
                }`}
              />
            </div>
            <span className="font-medium">
              {isLoading
                ? "Starting..."
                : isLocationShared
                ? "Location Shared"
                : "Share Live Location"}
            </span>
          </button>

          <Link
            to="/helpline-number"
            className="bg-white p-4 rounded-xl shadow-md flex flex-col items-center justify-center text-center hover:bg-green-50 transition-colors cursor-pointer"
          >
            <div className="bg-green-100 p-3 rounded-full mb-2">
              <FaPhoneAlt className="text-green-600 text-xl" />
            </div>
            <span className="font-medium">Helpline Number</span>
          </Link>
        </div>

        {/* Live Location Map with Safety Features */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-xl font-bold text-purple-900 flex items-center gap-2">
              <FaMapMarkerAlt className="text-red-500" /> Live Location & Safety
            </h2>
            <p className="text-gray-500 text-sm">
              {crimesData?.length > 0
                ? `${crimesData.length} crime${
                    crimesData.length !== 1 ? "s" : ""
                  } reported nearby`
                : "No crimes reported nearby"}
            </p>
          </div>

          <div className="h-[34rem]">
            <MinimalMapView />
          </div>
        </div>

        {/* Emergency Services Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800">
            Emergency Services Nearby
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Police Stations Card with scrollable list */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-blue-100">
              <div className="bg-blue-600 p-4 text-white flex items-center gap-2">
                <MdLocalPolice className="text-xl" />
                <h3 className="font-bold">Police Stations</h3>
              </div>
              <div className="h-60 overflow-y-auto">
                {policeStations && policeStations.length > 0 ? (
                  policeStations.map((station, index) => (
                    <div
                      key={index}
                      onClick={() => handleServiceClick(station)}
                      className="flex justify-between items-center p-3 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer border-b border-gray-100"
                    >
                      <div>
                        <h4 className="font-medium">
                          {station.displayName?.text}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {station.distance?.toFixed(1)} km away •{" "}
                          {station.formattedAddress}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <a
                          href="tel:100"
                          onClick={(e) => e.stopPropagation()}
                          className="bg-blue-100 text-blue-700 p-2 rounded-full hover:bg-blue-200 transition-colors"
                        >
                          <FaPhoneAlt />
                        </a>
                        <button className="bg-blue-100 text-blue-700 p-2 rounded-full hover:bg-blue-200 transition-colors cursor-pointer">
                          <FaExternalLinkAlt />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    <p>No police stations found nearby</p>
                  </div>
                )}
              </div>
            </div>

            {/* Hospitals Card with scrollable list */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-green-100">
              <div className="bg-green-600 p-4 text-white flex items-center gap-2">
                <MdLocalHospital className="text-xl" />
                <h3 className="font-bold">Hospitals</h3>
              </div>
              <div className="h-60 overflow-y-auto">
                {hospitals && hospitals.length > 0 ? (
                  hospitals.map((hospital, index) => (
                    <div
                      key={index}
                      onClick={() => handleServiceClick(hospital)}
                      className="flex justify-between items-center p-3 hover:bg-green-50 rounded-lg transition-colors cursor-pointer border-b border-gray-100"
                    >
                      <div>
                        <h4 className="font-medium">
                          {hospital.displayName?.text}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {hospital.distance?.toFixed(1)} km away •{" "}
                          {hospital.formattedAddress}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <a
                          href="tel:108"
                          onClick={(e) => e.stopPropagation()}
                          className="bg-green-100 text-green-700 p-2 rounded-full hover:bg-green-200 transition-colors"
                        >
                          <FaPhoneAlt />
                        </a>
                        <button className="bg-green-100 text-green-700 p-2 rounded-full hover:bg-green-200 transition-colors cursor-pointer">
                          <FaExternalLinkAlt />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    <p>No hospitals found nearby</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Safety Tips Section */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-xl font-bold text-yellow-800 mb-3">
            Safety Tips
          </h2>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="bg-yellow-100 text-yellow-800 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                1
              </div>
              <p className="text-gray-700">
                Share your live location with trusted contacts when traveling
                alone
              </p>
            </div>
            <div className="flex gap-3">
              <div className="bg-yellow-100 text-yellow-800 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                2
              </div>
              <p className="text-gray-700">
                Use well-lit, populated routes at night
              </p>
            </div>
            <div className="flex gap-3">
              <div className="bg-yellow-100 text-yellow-800 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                3
              </div>
              <p className="text-gray-700">
                Keep emergency numbers saved in your phone
              </p>
            </div>
          </div>
        </div>
      </div>

      {showContactSelector && (
        <div className="fixed inset-0 bg-transparent bg-opacity-10 backdrop-blur-lg flex items-center justify-center z-50 p-4">
          <div className="bg-white shadow-2xl rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <ContactSelector 
              location_id={tempLocationId}
              onComplete={handleContactSelectionComplete}
              requireSelection={true}
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default UserDashboard;
