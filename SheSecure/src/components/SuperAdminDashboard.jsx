import { useState, useEffect } from "react";
import {
  FaUserShield,
  FaCheck,
  FaTimes,
  FaUser,
  FaUsers,
  FaBell,
  FaSearch,
  FaArrowLeft,
  FaUserCheck,
  FaExternalLinkAlt,
} from "react-icons/fa";
import { approveAdmin, rejectAdmin } from "../routes/superAdmin-routes.js";
import { fetchAllUser } from "../routes/admin-routes";
import { useSelector } from "react-redux";

const SuperAdminDashboard = () => {
  // State for user data and UI
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeAdmins: 0,
    totalCounselors: 0,
    pendingRequests: 0,
  });
  const [selectedTab, setSelectedTab] = useState("requests");
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [userToReject, setUserToReject] = useState(null);

  const token = useSelector((state)=>state.auth.token);

  // Fetch all users and calculate stats
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const users = await fetchAllUser(token);
        setAllUsers(users);
        calculateStats(users);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculateStats = (users) => {
    const activeAdmins = users.filter(
      (user) => user.userType === "Admin" && user.approved === "Verified"
    ).length;

    const pendingRequests = users.filter(
      (user) => user.userType === "Admin" && user.approved === "Unverified"
    ).length;

    const totalUsers = users.filter(
      (user) => user.userType === "User"
    ).length;

    const totalCounselors = users.filter(
      (user) => user.userType === "Counsellor" && user.approved === "Verified"
    ).length;

    setStats({
      totalUsers,
      activeAdmins,
      totalCounselors,
      pendingRequests,
    });
  };

  // Handle admin verification
  const handleVerifyAdmin = async (userId) => {
    try {
      await approveAdmin(token, userId);
      const updatedUsers = allUsers.map((user) =>
        user._id === userId ? { ...user, approved: "Verified" } : user
      );
      setAllUsers(updatedUsers);
      calculateStats(updatedUsers);
    } catch (error) {
      console.error("Error approving admin:", error);
    }
  };

  // Handle admin rejection confirmation
  const confirmRejectAdmin = (user) => {
    setUserToReject(user);
    setShowRejectConfirm(true);
  };

  // Handle admin rejection
  const handleRejectAdmin = async () => {
    try {
      await rejectAdmin(token, userToReject._id);
      const updatedUsers = allUsers.filter((user) => user._id !== userToReject._id);
      setAllUsers(updatedUsers);
      calculateStats(updatedUsers);
      setShowRejectConfirm(false);
      setUserToReject(null);
      if (selectedUser && selectedUser._id === userToReject._id) {
        setSelectedUser(null);
      }
    } catch (error) {
      console.error("Error rejecting admin:", error);
    }
  };

  // Filter data based on search term
  const filteredUsers = allUsers.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.firstName.toLowerCase().includes(searchLower) ||
      user.lastName.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.mobileNumber.toString().includes(searchTerm) ||
      user.userType.toLowerCase().includes(searchLower) ||
      user.approved.toLowerCase().includes(searchLower)
    );
  });

  // Filter data for different tabs
  const unverifiedAdmins = filteredUsers.filter(
    (user) => user.userType === "Admin" && user.approved === "Unverified"
  );

  const verifiedAdmins = filteredUsers.filter(
    (user) => user.userType === "Admin" && user.approved === "Verified"
  );

  const verifiedCounselors = filteredUsers.filter(
    (user) => user.userType === "Counsellor" && user.approved === "Verified"
  );

  const regularUsers = filteredUsers.filter(
    (user) => user.userType === "User"
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Reject Confirmation Modal */}
      {showRejectConfirm && (
        <div className="fixed inset-0 bg-transparent bg-opacity-10 backdrop-blur-lg shadow-2xl flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 transform transition-all duration-300 animate-in fade-in-50 zoom-in-95">
            <div className="flex flex-col items-center">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <FaTimes className="h-6 w-6 text-red-600" />
              </div>
              <div className="mt-3 text-center sm:mt-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {selectedTab === "requests" ? "Reject Admin Request" : "Revoke Admin Status"}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to {selectedTab === "requests" ? "reject" : "revoke"} admin for{" "}
                    <span className="font-semibold">{userToReject?.firstName} {userToReject?.lastName}</span>?
                    {selectedTab === "admins" && " This will remove their admin privileges."}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-6 flex justify-center space-x-4">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 cursor-pointer"
                onClick={() => setShowRejectConfirm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 cursor-pointer"
                onClick={handleRejectAdmin}
              >
                Confirm {selectedTab === "requests" ? "Reject" : "Revoke"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto p-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                <FaUser size={20} />
              </div>
              <div>
                <p className="text-gray-500">Total Users</p>
                <h3 className="text-2xl font-bold">{stats.totalUsers}</h3>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                <FaUserShield size={20} />
              </div>
              <div>
                <p className="text-gray-500">Active Admins</p>
                <h3 className="text-2xl font-bold">{stats.activeAdmins}</h3>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                <FaUsers size={20} />
              </div>
              <div>
                <p className="text-gray-500">Total Counsellors</p>
                <h3 className="text-2xl font-bold">{stats.totalCounselors}</h3>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                <FaBell size={20} />
              </div>
              <div>
                <p className="text-gray-500">Pending Requests</p>
                <h3 className="text-2xl font-bold">{stats.pendingRequests}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6 relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-all duration-300 group-focus-within:text-indigo-600">
            <FaSearch className="text-gray-400 group-focus-within:text-indigo-500" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 shadow-sm hover:shadow-md focus:shadow-lg"
            placeholder="Search users by name, email, type, etc."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <FaTimes className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setSelectedTab("requests")}
              className={`px-6 py-3 font-medium cursor-pointer ${
                selectedTab === "requests"
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-500"
              }`}
            >
              Admin Requests
            </button>
            <button
              onClick={() => setSelectedTab("admins")}
              className={`px-6 py-3 font-medium cursor-pointer ${
                selectedTab === "admins"
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-500"
              }`}
            >
              Verified Admins
            </button>
            <button
              onClick={() => setSelectedTab("counselors")}
              className={`px-6 py-3 font-medium cursor-pointer ${
                selectedTab === "counselors"
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-500"
              }`}
            >
              All Counsellors
            </button>
            <button
              onClick={() => setSelectedTab("users")}
              className={`px-6 py-3 font-medium cursor-pointer ${
                selectedTab === "users"
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-500"
              }`}
            >
              All Users
            </button>
          </div>
        </div>

        {/* User Details Modal */}
        {selectedUser && (
          <>
            {/* Main Modal */}
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
              <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl transform transition-all duration-300 scale-95 animate-in fade-in-50 zoom-in-95">
                {/* Header */}
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      User Profile
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                      Detailed information about this user
                    </p>
                  </div>
                  <div className="flex space-x-6">
                    {selectedTab === "requests" &&
                      selectedUser.approved === "Unverified" && (
                        <button
                          onClick={() => {
                            handleVerifyAdmin(selectedUser._id);
                            setSelectedUser(null);
                          }}
                          className="flex items-center px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow hover:shadow-md transition-all cursor-pointer"
                          title="Approve Admin"
                        >
                          <FaCheck className="mr-1" size={16} />
                          Approve
                        </button>
                      )}
                    {(selectedTab === "requests" ||
                      selectedTab === "admins") && (
                      <button
                        onClick={() => confirmRejectAdmin(selectedUser)}
                        className="flex items-center px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow hover:shadow-md transition-all cursor-pointer"
                        title="Reject Admin"
                      >
                        <FaTimes className="mr-1" size={16} />
                        Reject
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedUser(null)}
                      className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                      title="Close"
                    >
                      <FaTimes size={18} />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Left Column - Profile */}
                  <div className="w-full md:w-1/3 flex flex-col items-center">
                    {/* Profile Image with Zoom */}
                    <div className="relative mb-4 cursor-pointer group">
                      {selectedUser.additionalDetails?.image ? (
                        <>
                          <img
                            src={selectedUser.additionalDetails.image}
                            alt="Profile"
                            className="w-48 h-48 rounded-full object-cover border-4 border-indigo-100 shadow-lg transition-all duration-300 group-hover:border-indigo-200 group-hover:scale-105"
                          />
                        </>
                      ) : (
                        <div className="w-48 h-48 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center border-4 border-indigo-100 shadow-lg">
                          <span className="text-5xl font-bold text-indigo-500">
                            {selectedUser.firstName?.charAt(0) || "U"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Basic Info */}
                    <div className="text-center space-y-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {selectedUser.firstName} {selectedUser.lastName}
                      </h3>
                      <p className="text-indigo-600 font-medium">
                        {selectedUser.userType}
                      </p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          selectedUser.approved === "Verified"
                            ? "bg-green-100 text-green-800"
                            : selectedUser.approved === "Blocked"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {selectedUser.approved}
                      </span>
                    </div>
                  </div>

                  {/* Right Column - Details */}
                  <div className="w-full md:w-2/3 space-y-6">
                    {/* Contact & Account Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 hover:border-indigo-200 transition-all">
                        <h4 className="font-semibold text-gray-700 mb-2">
                          Contact Information
                        </h4>
                        <div className="space-y-2">
                          <p className="text-gray-700">
                            <span className="font-medium text-gray-600">
                              Email:
                            </span>{" "}
                            {selectedUser.email}
                          </p>
                          <p className="text-gray-700">
                            <span className="font-medium text-gray-600">
                              Phone:
                            </span>{" "}
                            {selectedUser.mobileNumber || "N/A"}
                          </p>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 hover:border-indigo-200 transition-all">
                        <h4 className="font-semibold text-gray-700 mb-2">
                          Account Information
                        </h4>
                        <div className="space-y-2">
                          <p className="text-gray-700">
                            <span className="font-medium text-gray-600">
                              Created:
                            </span>{" "}
                            {new Date(selectedUser.createdAt).toLocaleString()}
                          </p>
                          <p className="text-gray-700">
                            <span className="font-medium text-gray-600">
                              Last Updated:
                            </span>{" "}
                            {new Date(selectedUser.updatedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Additional Details */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 hover:border-indigo-200 transition-all">
                      <h4 className="font-semibold text-gray-700 mb-2">
                        Additional Details
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <p className="text-gray-700">
                          <span className="font-medium text-gray-600">
                            Address:
                          </span>{" "}
                          {selectedUser.additionalDetails?.address || "N/A"}
                        </p>
                        <p className="text-gray-700">
                          <span className="font-medium text-gray-600">
                            Date of Birth:
                          </span>{" "}
                          {selectedUser.additionalDetails?.dob
                            ? new Date(
                                selectedUser.additionalDetails.dob
                              ).toLocaleDateString()
                            : "N/A"}
                        </p>
                        <p className="text-gray-700">
                          <span className="font-medium text-gray-600">
                            Gender:
                          </span>{" "}
                          {selectedUser.additionalDetails?.gender || "N/A"}
                        </p>
                      </div>
                    </div>

                    {/* Qualifications */}
                    {selectedUser.qualification?.length > 0 && (
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 hover:border-indigo-200 transition-all">
                        <h4 className="font-semibold text-gray-700 mb-2">
                          Qualifications
                        </h4>
                        <div className="space-y-3">
                          {selectedUser.qualification.map((qual, index) => (
                            <div
                              key={index}
                              className="bg-white p-3 rounded-lg border border-gray-200 hover:shadow-md transition-all"
                            >
                              <div className="font-medium text-gray-900">
                                {qual.courseName}
                              </div>
                              {qual.percentage && (
                                <div className="text-sm text-gray-600 mt-1">
                                  Score: {qual.percentage}%
                                </div>
                              )}
                              {qual.certificate && (
                                <a
                                  href={qual.certificate}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center mt-2 text-sm text-indigo-600 hover:text-indigo-800"
                                >
                                  <FaExternalLinkAlt
                                    className="mr-1"
                                    size={12}
                                  />
                                  View Certificate
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Pending Admin Requests Tab */}
          {selectedTab === "requests" && (
            <div>
              <div className="p-4 border-b">
                <h2 className="text-xl font-semibold">
                  Pending Admin Requests ({unverifiedAdmins.length})
                </h2>
              </div>
              {unverifiedAdmins.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No pending admin requests found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Profile
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Submitted
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {unverifiedAdmins.map((admin) => (
                        <tr
                          key={admin._id}
                          className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                          onClick={() => setSelectedUser(admin)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {admin.additionalDetails?.image ? (
                                <img
                                  src={admin.additionalDetails.image}
                                  alt="Profile"
                                  className="h-12 w-12 rounded-full object-cover"
                                />
                              ) : (
                                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                                  <span className="text-indigo-600 font-medium">
                                    {admin.firstName?.charAt(0) || "A"}
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {admin.firstName} {admin.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {admin.email}
                            </div>
                            {admin.additionalDetails?.phone && (
                              <div className="text-sm text-gray-500 mt-1">
                                {admin.additionalDetails.phone}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(admin.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 animate-pulse">
                              Pending
                            </span>
                          </td>
                          <td
                            className="px-4 py-4 whitespace-nowrap text-sm font-medium"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleVerifyAdmin(admin._id)}
                                className="text-white bg-green-500 hover:bg-green-600 p-2 rounded-full transition-colors duration-200 shadow hover:shadow-md"
                                title="Approve Admin"
                              >
                                <FaCheck />
                              </button>
                              <button
                                onClick={() => confirmRejectAdmin(admin)}
                                className="text-white bg-red-500 hover:bg-red-600 ml-2 p-2 rounded-full transition-colors duration-200 shadow hover:shadow-md"
                                title="Reject Admin"
                              >
                                <FaTimes />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Verified Admins Tab */}
          {selectedTab === "admins" && (
            <div>
              <div className="p-4 border-b">
                <h2 className="text-xl font-semibold">
                  Verified Admins ({verifiedAdmins.length})
                </h2>
              </div>
              {verifiedAdmins.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No verified admins found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Profile
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Verified On
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {verifiedAdmins.map((admin) => (
                        <tr
                          key={admin._id}
                          className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                          onClick={() => setSelectedUser(admin)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {admin.additionalDetails?.image ? (
                                <img
                                  src={admin.additionalDetails.image}
                                  alt="Profile"
                                  className="h-12 w-12 rounded-full object-cover"
                                />
                              ) : (
                                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                                  <span className="text-green-600 font-medium">
                                    {admin.firstName?.charAt(0) || "A"}
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {admin.firstName} {admin.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {admin.email}
                            </div>
                            {admin.additionalDetails?.phone && (
                              <div className="text-sm text-gray-500 mt-1">
                                {admin.additionalDetails.phone}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(admin.updatedAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Verified
                            </span>
                          </td>
                          <td
                            className="px-6 py-4 whitespace-nowrap text-sm font-medium"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => confirmRejectAdmin(admin)}
                              className="text-white bg-red-500 hover:bg-red-600 ml-4 p-2 rounded-full transition-colors duration-200 shadow hover:shadow-md"
                              title="Revoke Admin"
                            >
                              <FaTimes />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Counselors Tab */}
          {selectedTab === "counselors" && (
            <div>
              <div className="p-4 border-b">
                <h2 className="text-xl font-semibold">
                  All Counsellors ({verifiedCounselors.length})
                </h2>
              </div>
              {verifiedCounselors.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No counselors found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Profile
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Joined On
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {verifiedCounselors.map((counselor) => (
                        <tr
                          key={counselor._id}
                          className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                          onClick={() => setSelectedUser(counselor)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {counselor.additionalDetails?.image ? (
                                <img
                                  src={counselor.additionalDetails.image}
                                  alt="Profile"
                                  className="h-12 w-12 rounded-full object-cover"
                                />
                              ) : (
                                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                                  <span className="text-purple-600 font-medium">
                                    {counselor.firstName?.charAt(0) || "C"}
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {counselor.firstName} {counselor.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {counselor.email}
                            </div>
                            {counselor.additionalDetails?.phone && (
                              <div className="text-sm text-gray-500 mt-1">
                                {counselor.additionalDetails.phone}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(counselor.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                counselor.approved === "Verified"
                                  ? "bg-green-100 text-green-800"
                                  : counselor.approved === "Blocked"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {counselor.approved || "Pending"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Regular Users Tab */}
          {selectedTab === "users" && (
            <div>
              <div className="p-4 border-b">
                <h2 className="text-xl font-semibold">
                  All Users ({regularUsers.length})
                </h2>
              </div>
              {regularUsers.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No users found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Profile
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Joined On
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {regularUsers.map((user) => (
                        <tr
                          key={user._id}
                          className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                          onClick={() => setSelectedUser(user)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {user.additionalDetails?.image ? (
                                <img
                                  src={user.additionalDetails.image}
                                  alt="Profile"
                                  className="h-12 w-12 rounded-full object-cover"
                                />
                              ) : (
                                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                  <span className="text-blue-600 font-medium">
                                    {user.firstName?.charAt(0) || "U"}
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                            {user.additionalDetails?.phone && (
                              <div className="text-sm text-gray-500 mt-1">
                                {user.additionalDetails.phone}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                user.approved === "Verified"
                                  ? "bg-green-100 text-green-800"
                                  : user.approved === "Blocked"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {user.approved || "Pending"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;