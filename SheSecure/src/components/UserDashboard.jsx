import { useNavigate } from 'react-router-dom';

const UserDashboard=()=>{
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return(
        <>
            This is user Dashboard
            <button
            className="bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-700"
            onClick={handleLogout}
            >
            Logout
            </button>
        </>
    )
}

export default UserDashboard;