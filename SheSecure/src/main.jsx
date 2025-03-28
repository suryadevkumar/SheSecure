import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, Outlet, RouterProvider, useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Ensure you import this correctly
import { Provider, useDispatch, useSelector } from 'react-redux';
import './index.css';
import store from './redux/store';
import { setToken } from './redux/authSlice';
import useLocationTracking from './utils/Location'; // Import the hook here
import HomePage from './components/Home';
import Signup from './components/Signup';
import Error from './components/Error';
import Login from './components/Login';
import Toaster from './components/Toaster';
import UserDashboard from './components/UserDashboard';
import PoliceStation from './components/PoliceStation';
import EmergencyMap from './components/EmergencyMap';

function Front() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const publicPaths = ['/', '/login', '/signup', '/emergencyMap'];
  const [toasterVisible, setToasterVisible] = useState(false);
  const [toasterMessage, setToasterMessage] = useState('');
  const [toasterType, setToasterType] = useState('success');

  
  // Helper function to display success toaster
  const setSuccessToasterMessage = (message) => {
    setToasterMessage(message);
    setToasterType('success');
    setToasterVisible(true);
  };

  // Helper function to display error toaster
  const setErrorToasterMessage = (message) => {
    setToasterMessage(message);
    setToasterType('error');
    setToasterVisible(true);
  };

  // Close the toaster automatically after 3 seconds
  useEffect(() => {
    if (toasterVisible) {
      const timer = setTimeout(() => {
        setToasterVisible(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [toasterVisible]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(setToken(token));
    }

    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decodedToken.exp > currentTime) {
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
        alert("Invalid session, please login again");
        localStorage.removeItem('token');
        dispatch(setToken(null)); 
        navigate('/'); 
      }
    } else {
      if (!publicPaths.includes(location.pathname)) {
        alert("Please login to access this page");
        navigate('/');
      }
    }
  }, [location, navigate, dispatch]);

  return <Outlet />;
}

function AppWrapper() {
  // useLocationTracking();  
  return <Front />;
}

const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <AppWrapper />,
    errorElement: <Error />,
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path: 'signup',
        element: <Signup />,
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'userDashboard',
        element: <UserDashboard />,
      },
      {
        path: 'police',
        element: <PoliceStation />,
      },
      {
        path: 'emergencyMap',
        element: <EmergencyMap />,
      },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={appRouter} />
    </Provider>
  </StrictMode>
);
