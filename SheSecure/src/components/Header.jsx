import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import { useSelector, useDispatch } from 'react-redux';
import { setToken } from '../redux/authSlice';
import { useSOSSystem } from '../utils/SOSSystem.js';

const Header = () => {
    const dispatch = useDispatch();
    const isSOSActive = useSelector((state) => state.sos.isSOSActive);
    const token = useSelector((state) => state.auth.token);
    const { startSOS, stopSOS } = useSOSSystem();
    const navigate = useNavigate();
    const [showProfileBox, setShowProfileBox] = useState(false);
    const profileRef = useRef(null);

    const Logout = () => {
        localStorage.removeItem('token');
        dispatch(setToken(null));
        navigate('/login');
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setShowProfileBox(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [profileRef]);

    return (
        <>
            {!token && (<nav className="bg-white shadow h-[3rem] p-2 flex justify-between items-center">
                <Link to="/" className="flex items-center cursor-pointer">
                    <img
                        src={logo}
                        alt="SheSecure Logo"
                        className="h-9 w-9"
                    />
                    <span className="font-bold text-xl text-gray-800 ml-2">SheSecure</span>
                </Link>
                <div className="space-x-4">
                    <Link to="/" className="text-black hover:text-red-500 font-bold text-sm py-2 px-4 rounded-md">Home</Link>
                    <Link to="/signup" className="text-black hover:text-red-500 font-bold text-sm py-2 px-4 rounded-md">Sign Up</Link>
                    <Link to="/login" className="text-black hover:text-red-500 font-bold text-sm py-2 px-4 rounded-md">Login</Link>
                </div>
            </nav>)}

            {token && (<nav className="bg-white shadow h-[3rem] p-2 flex justify-between items-center">
                <Link to="/userDashboard" className="flex items-center cursor-pointer">
                    <img src={logo} alt="SheSecure Logo" className="h-9 w-9" />
                    <span className="font-bold text-xl text-gray-800 ml-2">SheSecure</span>
                </Link>
                <div className="flex items-center space-x-4" ref={profileRef}>
                    <Link to="/userDashboard" className="text-black hover:text-red-500 font-bold text-sm py-2 px-4 rounded-md">Dashboard</Link>
                    <Link to="/map-view" className="text-black hover:text-red-500 font-bold text-sm py-2 px-4 rounded-md cursor-pointer">View Map</Link>
                    <button className={`${isSOSActive ? 'bg-green-500' : 'bg-red-500'}  font-semibold text-white text-sm px-2 py-1 rounded-lg hover:bg-red-700 cursor-pointer`}
                        onClick={isSOSActive?stopSOS:startSOS}>
                        {isSOSActive ? 'SOS Activated' : 'Activate SOS'}
                    </button>
                    <img src={logo} alt="Profile" className="h-9 w-9 rounded-full cursor-pointer" onClick={() => setShowProfileBox(!showProfileBox)} />
                    {showProfileBox && (
                        <div className="absolute right-[0] top-[50px] w-56 shadow-lg bg-white border-t-gray-400 border-t-4 z-50">
                            <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                <a
                                    href="#"
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    role="menuitem"
                                >
                                    My Profile
                                </a>
                                <a
                                    href="#"
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    role="menuitem"
                                >
                                    SOS Histrory
                                </a>
                                <a
                                    href="#"
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    role="menuitem"
                                >
                                    Edit Profile
                                </a>
                                <a
                                    href="#"
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    role="menuitem"
                                >
                                    Location History
                                </a>
                                <a
                                    href="#"
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    role="menuitem"
                                >
                                    Report
                                </a>
                                <a
                                    href="#"
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    role="menuitem"
                                >
                                    Report Status
                                </a>
                                <span
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    role="menuitem"
                                    onClick={Logout}
                                >
                                    Logout
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </nav>)}
        </>
    );
};

export default Header;