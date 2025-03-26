import { StrictMode, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, Outlet, RouterProvider, useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Ensure you import this correctly
import { Provider } from 'react-redux';
import './index.css';
import store from './redux/store';
import useLocationTracking from './utils/Location';
import HomePage from './components/Home';
import Signup from './components/Signup';
import Error from './components/Error';
import Login from './components/Login';
import UserDashboard from './components/UserDashboard';
import PoliceStation from './components/PoliceStation';
import EmergencyMap from './components/EmergencyMap';

function Front() {
  const location = useLocation();
  const navigate = useNavigate();
  const publicPaths = ['/', '/login', '/signup', '/emergencyMap'];

  // Call location tracking hook
  useLocationTracking();

  useEffect(() => {
    const token = localStorage.getItem('token');

    // If the user is logged in and tries to go to login or signup, redirect them
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decodedToken.exp > currentTime) {
          // If the token is valid and not expired, redirect to UserDashboard or HomePage
          if (publicPaths.includes(location.pathname)) {
            navigate('/userDashboard'); // Or any other private page you want to redirect to
          }
        } else {
          alert("Session expired, please login again");
          localStorage.removeItem('token');
          navigate('/login'); // Redirect if token is expired
        }
      } catch (error) {
        console.error("Invalid token:", error);
        alert("Invalid session, please login again");
        localStorage.removeItem('token');
        navigate('/login'); // Redirect if token is invalid
      }
    } else {
      // If there's no token and the user tries to access private routes, redirect to login
      if (!publicPaths.includes(location.pathname)) {
        alert("Please login to access this page");
        navigate('/login'); // Redirect to login if no token
      }
    }
  }, [location, navigate]);

  return <Outlet />;
}

function AppWrapper() {
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
