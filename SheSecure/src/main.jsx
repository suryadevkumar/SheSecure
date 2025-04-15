import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./redux/store";
import "./index.css";
import axios from 'axios';
import HomePage from "./components/Home";
import Signup from "./components/Signup";
import Login from "./components/Login";
import Error from "./components/Error";
import MapView from "./components/MapView";
import EmergencyMap from "./components/EmergencyMap";
import AppWrapper from "./components/AppWrapper";
import ChatLayout from "./components/ChatLayout";
import SuperAdminDashboard from "./components/SuperAdminDashboard";
import CrimeReport from "./components/CrimeReport";
import LocationHistory from "./components/LocationHistory";
import Dashboard from "./components/Dashboard";

// Set default axios base URL
axios.defaults.baseURL = 'http://localhost:3000';


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
        path: "signup",
        element: <Signup />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "map-view",
        element: <MapView />,
      },
      {
        path: "location-history",
        element: <LocationHistory/>
      },
      {
        path: "emergency-sos",
        element: <EmergencyMap />,
      },
      { 
        path: "chat", 
        element: <ChatLayout /> 
      },
      { 
        path: "super", 
        element: <SuperAdminDashboard /> 
      },
      {
        path: "crimeReport",
        element: <CrimeReport/>
      }
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
