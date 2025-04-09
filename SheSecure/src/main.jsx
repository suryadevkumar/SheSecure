import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./redux/store";
import "./index.css";
import HomePage from "./components/Home";
import Signup from "./components/Signup";
import Login from "./components/Login";
import Error from "./components/Error";
import UserDashboard from "./components/UserDashboard";
import MapView from "./components/MapView";
import EmergencyMap from "./components/EmergencyMap";
import AppWrapper from "./components/AppWrapper";
import ChatLayout from "./components/ChatLayout";
import axios from 'axios';

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
        path: "userDashboard",
        element: <UserDashboard />,
      },
      {
        path: "map-view",
        element: <MapView />,
      },
      {
        path: "emergency-sos",
        element: <EmergencyMap />,
      },
      { 
        path: "chat", 
        element: <ChatLayout /> 
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
