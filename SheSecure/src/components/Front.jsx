import { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { setToken } from "../redux/authSlice";

// Define route permissions
const routePermissions = {
  // Public routes (no auth required)
  public: ["/", "/login", "/signup"],

  // Routes accessible by anyone (logged in or not)
  unrestricted: ["/emergency-sos", "/live-location"],

  // Routes accessible only by specific user types
  protected: {
    "/dashboard": ["User","Counsellor","Admin","SuperAdmin"],
    "/profile": ["User","Counsellor","Admin","SuperAdmin"],
    "/profile-update": ["User","Counsellor","Admin","SuperAdmin"],
    "/contactToCustomerCare": ["User","Counsellor","Admin"],
    "/chat": ["Counsellor", "User"],
    "/crimeReport": ["Admin", "User"],
    "/helpline-number": ["User"],
    "/feedback": ["User"],
    "/map-view": ["User"],
    "/emergency-contacts": ["User"],
    "/location-history": ["User"],

  },
};

const Front = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userType=JSON.parse(localStorage.getItem("user"))?.userType;
    
    // Check if current path is unrestricted (accessible to everyone)
    const isUnrestricted = routePermissions.unrestricted.some(route => 
      location.pathname.startsWith(route)
    );
    
    if (isUnrestricted) {
      return;
    }

    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decodedToken.exp > currentTime) {
          // If the user is logged in, they are redirected to dashboard if they try to access login/signup
          if (routePermissions.public.includes(location.pathname)) {
            navigate("/dashboard");
            return;
          }

          // Check protected routes
          const currentPath = Object.keys(routePermissions.protected).find(path => 
            location.pathname.startsWith(path)
          );

          if (currentPath) {
            const allowedUserTypes = routePermissions.protected[currentPath];
            if (!allowedUserTypes || !allowedUserTypes.includes(userType)) {
              toast.error("You don't have permission to access this page");
              navigate("/dashboard");
              return;
            }
          }

          dispatch({ type: "socket/initialize" });
        } else {
          toast.error("Session expired, please login again");
          localStorage.removeItem("token");
          dispatch(setToken(null));
          navigate("/login");
        }
      } catch (error) {
        console.error("Invalid token:", error);
        toast.error("Invalid session, please login again");
        localStorage.removeItem("token");
        dispatch(setToken(null));
        navigate("/");
      }
    } else {
      dispatch(setToken(null));
      // Allow access to public routes without login
      if (!routePermissions.public.includes(location.pathname)) {
        toast.error("Please login to access this page");
        navigate("/");
      }
    }
  }, [location, navigate, dispatch]);

  return <Outlet />;
};

export default Front;