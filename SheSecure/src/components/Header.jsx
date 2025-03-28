import { Link, useNavigate } from "react-router-dom"
import logo from '../assets/logo.png';

export const Header1=()=>{
    const navigate = useNavigate();

    const handleLogoClick = () => {
        navigate('/');
    };
    return(
        <nav className="bg-white shadow p-2 flex justify-between items-center">
            <div className="flex items-center cursor-pointer" onClick={handleLogoClick}>
                <img
                    src={logo}
                    alt="SheSecure Logo"
                    className="h-12 w-12"
                />
                <span className="font-bold text-2xl text-gray-800 ml-2">SheSecure</span>
            </div>
            <div className="space-x-4">
                <Link to="/" className="text-black hover:text-red-500 font-bold text-xl py-2 px-4 rounded-md">Home</Link>
                <Link to="/signup" className="text-black hover:text-red-500 font-bold text-xl py-2 px-4 rounded-md">Sign Up</Link>
                <Link to="/login" className="text-black hover:text-red-500 font-bold text-xl py-2 px-4 rounded-md">Login</Link>
            </div>
        </nav>
    )
}
export const Header2=()=>{
    const navigate = useNavigate();

    const handleLogoClick = () => {
        navigate('/');
    };

    const Logout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return(
        <nav className="bg-white shadow p-2 flex justify-between items-center">
            <div className="flex items-center cursor-pointer" onClick={handleLogoClick}>
                <img
                    src={logo}
                    alt="SheSecure Logo"
                    className="h-12 w-12"
                />
                <span className="font-bold text-2xl text-gray-800 ml-2">SheSecure</span>
            </div>
            <div className="space-x-4">
                <Link to="/userDashboard" className="text-black hover:text-red-500 font-bold text-xl py-2 px-4 rounded-md">Home</Link>
                <span className="text-black hover:text-red-500 font-bold text-xl py-2 px-4 rounded-md cursor-pointer" onClick={Logout}>Log out</span>
            </div>
        </nav>
    )
}