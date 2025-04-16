import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo1.png";
import { useSelector, useDispatch } from "react-redux";
import { setToken } from "../redux/authSlice";
import useSosSocket from "../utils/sosSocket";

const Header = () => {
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);
  const isSOSActive = useSelector((state) => state.sos.isSOSActive);
  const dispatch = useDispatch();
  const { startSOS, stopSOS } = useSosSocket();
  const navigate = useNavigate();
  const [showProfileBox, setShowProfileBox] = useState(false);
  const profileRef = useRef(null);

  const Logout = () => {
    localStorage.removeItem("token");
    dispatch(setToken(null));
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileBox(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileRef]);

  return (
    <>
      {!token && (
        <nav className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg h-[4.5rem] py-2 lg:px-20 sm:px-2 flex justify-between items-center fixed w-full top-0 z-50">
          <Link to="/" className="flex items-center cursor-pointer">
            <img src={logo} alt="SheSecure Logo" className="h-14" />
          </Link>
          <div className="space-x-4">
            <Link
              to="/"
              className="text-white hover:text-yellow-200 font-bold text-sm py-2 px-4 rounded-md transition-colors duration-200"
            >
              Home
            </Link>
            <Link
              to="/signup"
              className="text-white hover:text-yellow-200 font-bold text-sm py-2 px-4 rounded-md transition-colors duration-200"
            >
              Sign Up
            </Link>
            <Link
              to="/login"
              className="bg-white text-blue-600 hover:bg-blue-50 font-bold text-sm py-2 px-4 rounded-md transition-colors duration-200"
            >
              Login
            </Link>
          </div>
        </nav>
      )}

      {token && (
        <>
          <nav className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg h-[4 rem] py-1 lg:px-20 sm:px-2 flex justify-between items-center fixed w-full top-0 z-50">
            <Link
              to="/dashboard"
              className="flex items-center cursor-pointer"
            >
              <img src={logo} alt="SheSecure Logo" className="h-14" />
            </Link>
            <div className="flex items-center space-x-6" ref={profileRef}>
              <Link
                to="/dashboard"
                className="text-white hover:text-yellow-200 font-bold text-sm py-2 px-4 rounded-md transition-colors duration-200"
              >
                Dashboard
              </Link>
              {user.userType === 'User' && (
                <button
                  className={`${
                    isSOSActive ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
                  } font-semibold text-white text-sm px-4 py-2 rounded-lg transition-colors duration-200 shadow-md cursor-pointer flex items-center`}
                  onClick={isSOSActive ? stopSOS : startSOS}
                >
                  {isSOSActive ? (
                    <>
                      <span className="relative flex h-3 w-3 mr-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                      </span>
                      SOS Active
                    </>
                  ) : (
                    "Activate SOS"
                  )}
                </button>
              )}
              <div className="relative">
                <div 
                  className="flex items-center space-x-2 cursor-pointer group"
                  onClick={() => setShowProfileBox(!showProfileBox)}
                >
                  <img
                    src={user.additionalDetails.image}
                    alt="Profile"
                    className="h-10 w-10 ring-2 ring-white rounded-full transition-transform duration-200 group-hover:scale-110"
                  />
                </div>
                {showProfileBox && (
                  <div className="absolute right-0 top-[53px] w-64 shadow-xl bg-white rounded-lg overflow-hidden z-50 border border-gray-200">
                    <div className="py-2">
                      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                        <p className="text-sm font-medium text-gray-800">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors duration-150"
                        onClick={() => setShowProfileBox(false)}
                      >
                        <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        My Profile
                      </Link>
                      {user.userType === 'User' && (
                        <Link
                          to="./map-view"
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors duration-150"
                          onClick={() => setShowProfileBox(false)}
                        >
                          <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Nearest Services
                        </Link>
                      )}
                      {user.userType==='User' && <Link
                        to="./location-history"
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors duration-150"
                        onClick={() => setShowProfileBox(false)}
                      >
                        <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Location History
                      </Link>}
                      {(user.userType==='User' || user.userType==='Counsellor') && <Link
                        to="./chat"
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors duration-150"
                        onClick={() => setShowProfileBox(false)}
                      >
                        <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {user.userType === "User" ? "Contact Counsellor" : "Contact User"}
                      </Link>}
                      {(user.userType==='User' || user.userType==='Admin') && <Link
                        to="/crimeReport"
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors duration-150"
                        onClick={() => setShowProfileBox(false)}
                      >
                        <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Crime Report
                      </Link>}
                      <div 
                        className="flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 cursor-pointer transition-colors duration-150"
                        onClick={Logout}
                      >
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </nav>
          {/* Add padding to the top of the page content to account for fixed header */}
          <div className="h-[4.5rem]"></div>
        </>
      )}
    </>
  );
};

export default Header;