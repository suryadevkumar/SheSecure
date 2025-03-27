import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, Outlet, RouterProvider, useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Ensure you import this correctly
import { Provider, useDispatch } from 'react-redux';
import './index.css';
import store from './redux/store';
import { setToken } from './redux/authSlice';
import useLocationTracking from './utils/Location'; // Import the hook here
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
  const dispatch = useDispatch();
  const publicPaths = ['/', '/login', '/signup', '/emergencyMap'];

  // Fetch token from localStorage and dispatch to Redux
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(setToken(token));  // Dispatch token to Redux
    }

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
          dispatch(setToken(null)); // Remove token from Redux
          navigate('/login'); // Redirect if token is expired
        }
      } catch (error) {
        console.error("Invalid token:", error);
        alert("Invalid session, please login again");
        localStorage.removeItem('token');
        dispatch(setToken(null)); // Remove token from Redux
        navigate('/login'); // Redirect if token is invalid
      }
    } else {
      // If there's no token and the user tries to access private routes, redirect to login
      if (!publicPaths.includes(location.pathname)) {
        alert("Please login to access this page");
        navigate('/login'); // Redirect to login if no token
      }
    }
  }, [location, navigate, dispatch]);

  return <Outlet />;
}

function AppWrapper() {
  // Ensure that the useLocationTracking hook is fired right when the page loads
  useLocationTracking(); // This will run the location tracking on page load, including after a refresh
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