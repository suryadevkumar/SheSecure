import UserDashboard from "./UserDashboard";
import AdminDashboard from "./AdminDashboard";
import SuperAdminDashboard from "./SuperAdminDashboard"
import ChatLayout from "./ChatLayout";
import { useSelector } from "react-redux";

const Dashboard = () => {
  const userType = useSelector((state) => state.auth.user?.userType);

  switch (userType) {
    case "User":
      return <UserDashboard />;
    case "Counsellor":
      return <ChatLayout />
    case "Admin":
      return <AdminDashboard />;
    case "SuperAdmin":
      return <SuperAdminDashboard />
  }
};

export default Dashboard;
