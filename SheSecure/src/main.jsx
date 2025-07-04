import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./redux/store";
import "./index.css";
import axios from 'axios';
import { useSelector } from 'react-redux';
import { wsUrl } from "./config/config";
import useLocationTracking from './utils/useLocation.js';
import { ToastContainer } from 'react-toastify';
import Header from "./components/Header.jsx"
import Footer from "./components/Footer.jsx"
import Front from "./components/Front.jsx"
import HomePage from "./components/Home";
import Signup from "./components/Signup";
import Login from "./components/Login";
import Error from "./components/Error";
import ChatLayout from "./components/ChatLayout";
import CrimeReport from "./components/CrimeReport";
import Dashboard from "./components/Dashboard";
import MyProfile from "./components/MyProfile";
import UpdateProfile from "./components/UpdateProfile";
import EmergencyContacts from "./components/EmergencyContacts";
import EmergencyNumbers from "./components/HelplineNumbers";
import SharedMap from "./components/SharedMap";
import Feedback from './components/Feedback';
import CustomerCareForm from './components/CustomerCareForm';
import { FullMapView, HistoryMapView } from "./components/MapView";



// Set default axios base URL
axios.defaults.baseURL = wsUrl;

const AppWrapper=()=> {
  const userType = useSelector((state) => state.auth.user?.userType);
  const token = useSelector((state) => state.auth.token);
  
  if (userType === 'User' && token) {
    useLocationTracking();
  }

  return (
    <>
      <ToastContainer position="top-center" autoClose={3000}/>
      <Header />
      <Front />
      <Footer />
    </>
  );
}

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <AppWrapper />,
    errorElement: <Error />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/signup",
        element: <Signup />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/dashboard",
        element: <Dashboard />,
      },
      {
        path: "/map-view",
        element: <FullMapView />,
      },
      {
        path: "/location-history",
        element: <HistoryMapView/>
      },
      {
        path: "/emergency-sos",
        element: <SharedMap />,
      },
      {
        path: "/live-location",
        element: <SharedMap />,
      },
      { 
        path: "/chat", 
        element: <ChatLayout /> 
      },
      { 
        path: "/profile", 
        element: <MyProfile /> 
      },
      { 
        path: "/profile-update", 
        element:  <UpdateProfile />
      },
      { 
        path: "/emergency-contacts", 
        element:  <EmergencyContacts />
      },
      {
        path: "/crimeReport",
        element: <CrimeReport />
      },
      {
        path: "/helpline-number",
        element: <EmergencyNumbers />
      },
      {
        path:'/feedback',
        element:<Feedback/>,
      },
      {
        path:'/contactToCustomerCare',
        element:<CustomerCareForm/>,
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={appRouter} />
    </Provider>
  </StrictMode>
);
