import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo1.png";
import { useSelector, useDispatch } from "react-redux";
import { setToken } from "../redux/authSlice";
import useSosSocket from "../utils/useSOSSystem";
import {
  Bell,
  Menu,
  Home,
  UserPlus,
  LogIn,
  LayoutDashboard,
  AlertCircle,
  UserCircle,
  Edit,
  History,
  MessageCircle,
  MapPin,
  HelpCircle,
  ThumbsUp,
  ShieldCheck,
  LogOut,
} from "lucide-react";

const Header = () => {
  const location = useLocation();
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
      {!token && location.pathname !== "/" && (
        <>
          <nav className=" bg-white shadow-lg h-[4rem] py-2 lg:px-20 sm:px-2 flex justify-between items-center fixed w-full top-0 z-50">
            <Link to="/" className="flex items-center cursor-pointer">
              <img src={logo} alt="SheSecure Logo" className="h-14" />
            </Link>
            <div className="space-x-4">
              <Link
                to="/"
                className="hover:text-blue-600 font-semibold py-2 px-4 rounded-md transition-colors duration-200"
              >
                Home
              </Link>
              <Link
                to="/signup"
                className="hover:text-blue-600 font-semibold py-2 px-4 rounded-md transition-colors duration-200"
              >
                Sign Up
              </Link>
              <Link
                to="/login"
                className="hover:text-blue-600 font-semibold py-2 px-4 rounded-md transition-colors duration-200"
              >
                Login
              </Link>
            </div>
          </nav>
          <div className="h-[4rem]"></div>
        </>
      )}

      {token && (
        <>
          <nav className="bg-white shadow-lg h-[4 rem] py-1 lg:px-20 sm:px-2 flex justify-between items-center fixed w-full top-0 z-50">
            <Link to="/dashboard" className="flex items-center cursor-pointer">
              <img src={logo} alt="SheSecure Logo" className="h-14" />
            </Link>
            <div className="flex items-center space-x-6" ref={profileRef}>
              <Link
                to="/dashboard"
                className="flex gap-2 hover:text-blue-600 font-bold text-sm py-2 px-4 rounded-md transition-colors duration-200"
              >
                <LayoutDashboard size={18} />
                <span className="hidden lg:block">Dashboard</span>
              </Link>
              {user.userType === "User" && (
                <button
                  className={`${
                    isSOSActive
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-red-500 hover:bg-red-600"
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
                        <p className="text-sm font-medium text-gray-800">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        className="flex gap-4 items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors duration-150"
                        onClick={() => setShowProfileBox(false)}
                      >
                        <UserCircle size={16} />
                        My Profile
                      </Link>
                      <Link
                        to="/Profile-update"
                        onClick={() => setShowProfileBox(false)}
                        className="flex gap-4 items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors duration-150"
                      >
                        <Edit size={16} /> Edit Profile
                      </Link>

                      {user?.userType === "User" && (
                        <>
                          <Link
                            to="/location-history"
                            onClick={() => setShowProfileBox(false)}
                            className="flex gap-4 items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors duration-150"
                          >
                            <History size={16} /> Location History
                          </Link>
                          <Link
                            to="/chat"
                            onClick={() => setShowProfileBox(false)}
                            className="flex gap-4 items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors duration-150"
                          >
                            <MessageCircle size={16} /> Contact Counselor
                          </Link>
                          <Link
                            to="/crimeReport"
                            onClick={() => setShowProfileBox(false)}
                            className="flex gap-4 items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors duration-150"
                          >
                            <ShieldCheck size={16} /> Crime Report
                          </Link>
                          <Link
                            to="/map-view"
                            onClick={() => setShowProfileBox(false)}
                            className="flex gap-4 items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors duration-150"
                          >
                            <MapPin size={16} /> Nearest Services
                          </Link>
                          <Link
                            to="/helpline-number"
                            onClick={() => setShowProfileBox(false)}
                            className="flex gap-4 items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors duration-150"
                          >
                            <HelpCircle size={16} /> Helpline Numbers
                          </Link>
                          <Link
                            to="/contactToCustomerCare"
                            onClick={() => setShowProfileBox(false)}
                            className="flex gap-4 items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors duration-150"
                          >
                            <HelpCircle size={16} /> Customer Care
                          </Link>
                          <Link
                            to="/feedback"
                            onClick={() => setShowProfileBox(false)}
                            className="flex gap-4 items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors duration-150"
                          >
                            <ThumbsUp size={16} /> Feedback
                          </Link>
                        </>
                      )}

                      {user?.userType === "Counsellor" && (
                        <>
                          <Link
                            to="/chat"
                            onClick={() => setShowProfileBox(false)}
                            className="flex gap-4 items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors duration-150"
                          >
                            <MessageCircle size={16} /> Contact User
                          </Link>
                          <Link
                            to="/contactToCustomerCare"
                            onClick={() => setShowProfileBox(false)}
                            className="flex gap-4 items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors duration-150"
                          >
                            <HelpCircle size={16} /> Customer Care
                          </Link>
                        </>
                      )}

                      {user?.userType === "Admin" && (
                        <>
                          <Link
                            to="/crimeReport"
                            onClick={() => setShowProfileBox(false)}
                            className="flex gap-4 items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors duration-150"
                          >
                            <ShieldCheck size={16} /> Crime Report
                          </Link>
                          <Link
                            to="/contactToCustomerCare"
                            onClick={() => setShowProfileBox(false)}
                            className="flex gap-4 items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors duration-150"
                          >
                            <HelpCircle size={16} /> Customer Care
                          </Link>
                        </>
                      )}

                      <div
                        className="flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 cursor-pointer transition-colors duration-150"
                        onClick={Logout}
                      >
                        <svg
                          className="w-5 h-5 mr-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
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
          <div className="h-[4rem]"></div>
        </>
      )}
    </>
  );
};

export default Header;
