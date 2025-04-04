import { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { setToken, setUser } from '../redux/authSlice';

const Front=()=> {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
  
    useEffect(() => {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      const publicPaths = ['/', '/login', '/signup']; 
      
      if (token) {
        dispatch(setToken(token));
        dispatch(setUser(user));
        try {
          const decodedToken = jwtDecode(token);
          const currentTime = Date.now() / 1000;
    
          if (decodedToken.exp > currentTime) {
            // If the user is logged in, they are redirected to userDashboard if they try to access login/signup
            if (publicPaths.includes(location.pathname)) {
              navigate('/userDashboard');
            }
          } else {
            alert("Session expired, please login again");
            localStorage.removeItem('token');
            dispatch(setToken(null));
            navigate('/login');
          }
        } catch (error) {
          console.error("Invalid token:", error);
          toast.error("Invalid session, please login again");
          localStorage.removeItem('token');
          dispatch(setToken(null));
          navigate('/');
        }
      } else {
        dispatch(setToken(null));
        // Allow access to public routes (including /emergencyMap) without login
        if(location.pathname.startsWith('/emergency-sos'));
        else if (!publicPaths.includes(location.pathname)) {
          toast.error("Please login to access this page");
          navigate('/');
        }
      }
    }, [location, navigate, dispatch]);  
  
    return <Outlet />;
};

export default Front;