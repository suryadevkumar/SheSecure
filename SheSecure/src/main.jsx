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
import AppWrapper from "./components/AppWrapper";
import ChatLayout from "./components/ChatLayout";
import CrimeReport from "./components/CrimeReport";
import Dashboard from "./components/Dashboard";
import MyProfile from "./components/MyProfile";
import UpdateProfile from "./components/UpdateProfile";
import EmergencyContacts from "./components/EmergencyContacts";
import EmergencyNumbers from "./components/HelplineNumbers";
import UnifiedMap from "./components/LocationMap";
import { FullMapView, HistoryMapView } from "./components/MapView";


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
        element: <FullMapView />,
      },
      {
        path: "location-history",
        element: <HistoryMapView/>
      },
      {
        path: "emergency-sos",
        element: <UnifiedMap />,
      },
      {
        path: "location",
        element: <UnifiedMap />,
      },
      { 
        path: "chat", 
        element: <ChatLayout /> 
      },
      { 
        path: "profile", 
        element: <MyProfile /> 
      },
      { 
        path: "profile-update", 
        element:  <UpdateProfile />
      },
      { 
        path: "emergency-contacts", 
        element:  <EmergencyContacts />
      },
      {
        path: "crimeReport",
        element: <CrimeReport />
      },
      {
        path: "helpline-number",
        element: <EmergencyNumbers />
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
