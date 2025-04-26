import { useState, useEffect } from 'react';
import { FaUserClock, FaUserCheck, FaCheck, FaTimes, FaSearch, FaUser, FaUsers, FaExternalLinkAlt } from 'react-icons/fa';
import { FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useSelector } from "react-redux";
import { fetchAllUser, approveCounsellor, rejectCounsellor } from '../routes/admin-routes';

const AdminDashboard = () => {
  // State management
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingCounsellors: 0,
    verifiedCounsellors: 0
  });
  const [selectedTab, setSelectedTab] = useState('requests');
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const token = useSelector((state)=>state.auth.token);

  // Data fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await fetchAllUser(token);
        if (!data) {
          throw new Error('No data received from server');
        }
        setUsers(data || []);
        calculateStats(data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to fetch user data');
        setUsers([]);
        calculateStats([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper functions
  const calculateStats = (users) => {
    const totalUsers = users.filter(user => user.userType === 'User').length;
    const pendingCounsellors = users.filter(user => 
      user.userType === 'Counsellor' && user.approved === 'Unverified'
    ).length;
    const verifiedCounsellors = users.filter(user => 
      user.userType === 'Counsellor' && user.approved === 'Verified'
    ).length;
    
    setStats({ totalUsers, pendingCounsellors, verifiedCounsellors });
  };

  // Action handlers
  const handleApproveCounsellor = async (userId) => {
    setSelectedUserId(userId);
    setShowApproveConfirm(true);
  };

  const confirmApproveCounsellor = async () => {
    setIsApproving(true);
    try {
      await approveCounsellor(token, selectedUserId);
      const updatedUsers = users.map(user => 
        user._id === selectedUserId ? { ...user, approved: 'Verified' } : user
      );
      setUsers(updatedUsers);
      calculateStats(updatedUsers);
      toast.success('Counsellor approved successfully');
      setSelectedUser(null);
    } catch (error) {
      toast.error(error.message || 'Failed to approve counsellor');
    } finally {
      setIsApproving(false);
      setShowApproveConfirm(false);
      setSelectedUserId(null);
    }
  };

  const handleRejectCounsellor = async (userId) => {
    setSelectedUserId(userId);
    setShowRejectConfirm(true);
  };

  const confirmRejectCounsellor = async () => {
    setIsRejecting(true);
    try {
      await rejectCounsellor(token, selectedUserId);
      const updatedUsers = users.filter(user => user._id !== selectedUserId);
      setUsers(updatedUsers);
      calculateStats(updatedUsers);
      toast.success('Counsellor rejected successfully');
      setSelectedUser(null);
    } catch (error) {
      toast.error(error.message || 'Failed to reject counsellor');
    } finally {
      setIsRejecting(false);
      setShowRejectConfirm(false);
      setSelectedUserId(null);
    }
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.firstName?.toLowerCase().includes(searchLower) ||
      user.lastName?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.mobileNumber?.toString().includes(searchTerm) ||
      user.userType?.toLowerCase().includes(searchLower) ||
      user.approved?.toLowerCase().includes(searchLower)
    );
  });

  const unverifiedCounsellors = filteredUsers.filter(user => 
    user.userType === 'Counsellor' && user.approved === 'Unverified'
  );
  
  const verifiedCounsellors = filteredUsers.filter(user => 
    user.userType === 'Counsellor' && user.approved === 'Verified'
  );
  
  const regularUsers = filteredUsers.filter(user => 
    user.userType === 'User'
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
      {/* Approve Confirmation Dialog */}
      {showApproveConfirm && (
        <div className="fixed inset-0 bg-transparent bg-opacity-50 backdrop-blur-xl shadow-2xl flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 transform transition-all duration-300 animate-in fade-in-50 zoom-in-95">
            <div className="flex flex-col items-center">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                <FiAlertCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="mt-3 text-center sm:mt-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Approve Counsellor
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to approve this counsellor? They will gain access to counsellor privileges.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-6 flex justify-center space-x-4">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 cursor-pointer"
                onClick={() => setShowApproveConfirm(false)}
                disabled={isApproving}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 cursor-pointer"
                onClick={confirmApproveCounsellor}
                disabled={isApproving}
              >
                {isApproving ? 'Approving...' : 'Confirm Approve'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Dialog */}
      {showRejectConfirm && (
        <div className="fixed inset-0 bg-transparent bg-opacity-50 backdrop-blur-xl shadow-2xl flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 transform transition-all duration-300 animate-in fade-in-50 zoom-in-95">
            <div className="flex flex-col items-center">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <FiAlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="mt-3 text-center sm:mt-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Reject Counsellor
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to reject this counsellor? This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-6 flex justify-center space-x-4">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 cursor-pointer"
                onClick={() => setShowRejectConfirm(false)}
                disabled={isRejecting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 cursor-pointer"
                onClick={confirmRejectCounsellor}
                disabled={isRejecting}
              >
                {isRejecting ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto p-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                <FaUserClock size={20} />
              </div>
              <div>
                <p className="text-gray-500">Pending Counsellors</p>
                <h3 className="text-2xl font-bold">{stats.pendingCounsellors}</h3>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                <FaUserCheck size={20} />
              </div>
              <div>
                <p className="text-gray-500">Verified Counsellors</p>
                <h3 className="text-2xl font-bold">{stats.verifiedCounsellors}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6 relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <FaTimes className="text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setSelectedTab('requests')}
              className={`px-6 py-3 font-medium cursor-pointer ${selectedTab === 'requests' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
            >
              <div className="flex items-center">
                <FaUserClock className="mr-2" />
                Pending Requests
              </div>
            </button>
            <button
              onClick={() => setSelectedTab('verified')}
              className={`px-6 py-3 font-medium cursor-pointer ${selectedTab === 'verified' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
            >
              <div className="flex items-center">
                <FaUserCheck className="mr-2" />
                Verified Counsellors
              </div>
            </button>
            <button
              onClick={() => setSelectedTab('users')}
              className={`px-6 py-3 font-medium cursor-pointer ${selectedTab === 'users' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
            >
              <div className="flex items-center">
                <FaUsers className="mr-2" />
                All Users
              </div>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Pending Requests Tab */}
          {selectedTab === 'requests' && (
            <div>
              <div className="p-4 border-b">
                <h2 className="text-xl font-semibold">Pending Counsellor Requests ({unverifiedCounsellors.length})</h2>
              </div>
              {unverifiedCounsellors.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No pending requests</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profile</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {unverifiedCounsellors.map((counsellor) => (
                        <tr 
                          key={counsellor._id} 
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => setSelectedUser(counsellor)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {counsellor.additionalDetails?.image ? (
                                <img 
                                  src={counsellor.additionalDetails.image} 
                                  alt="Profile" 
                                  className="h-12 w-12 rounded-full object-cover"
                                />
                              ) : (
                                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                                  <span className="text-purple-600 font-medium">{counsellor.firstName?.charAt(0) || 'C'}</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{counsellor.firstName} {counsellor.lastName}</div>
                            <div className="text-sm text-gray-500">{counsellor.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(counsellor.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              Pending
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" onClick={e => e.stopPropagation()}>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleApproveCounsellor(counsellor._id)}
                                disabled={isApproving}
                                className={`p-2 rounded-full text-white ${isApproving ? 'bg-green-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}`}
                              >
                                <FaCheck />
                              </button>
                              <button
                                onClick={() => handleRejectCounsellor(counsellor._id)}
                                disabled={isRejecting}
                                className={`p-2 rounded-full text-white ${isRejecting ? 'bg-red-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'}`}
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

          {/* Verified Counsellors Tab */}
          {selectedTab === 'verified' && (
            <div>
              <div className="p-4 border-b">
                <h2 className="text-xl font-semibold">Verified Counsellors ({verifiedCounsellors.length})</h2>
              </div>
              {verifiedCounsellors.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No verified counsellors</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profile</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verified On</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {verifiedCounsellors.map((counsellor) => (
                        <tr 
                          key={counsellor._id} 
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => setSelectedUser(counsellor)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {counsellor.additionalDetails?.image ? (
                                <img 
                                  src={counsellor.additionalDetails.image} 
                                  alt="Profile" 
                                  className="h-12 w-12 rounded-full object-cover"
                                />
                              ) : (
                                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                                  <span className="text-green-600 font-medium">{counsellor.firstName?.charAt(0) || 'C'}</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{counsellor.firstName} {counsellor.lastName}</div>
                            <div className="text-sm text-gray-500">{counsellor.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(counsellor.updatedAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Verified
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => handleRejectCounsellor(counsellor._id)}
                              disabled={isRejecting}
                              className={`p-2 rounded-full text-white ${isRejecting ? 'bg-red-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'}`}
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

          {/* All Users Tab */}
          {selectedTab === 'users' && (
            <div>
              <div className="p-4 border-b">
                <h2 className="text-xl font-semibold">All Users ({regularUsers.length})</h2>
              </div>
              {regularUsers.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No users found</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profile</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined On</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {regularUsers.map((user) => (
                        <tr 
                          key={user._id} 
                          className="hover:bg-gray-50 cursor-pointer"
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
                                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                  <span className="text-blue-600 font-medium">{user.firstName?.charAt(0) || 'U'}</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.approved === 'Verified' ? 'bg-green-100 text-green-800' : 
                              user.approved === 'Blocked' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {user.approved || 'Active'}
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

        {/* User Profile Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
              {/* Header */}
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  {selectedUser.userType === 'Counsellor' ? 'Counsellor' : 'User'} Profile
                </h2>
                <div className="flex space-x-6">
                  {selectedTab === 'requests' && 
                   selectedUser.userType === 'Counsellor' && 
                   selectedUser.approved === 'Unverified' && (
                    <button
                      onClick={() => handleApproveCounsellor(selectedUser._id)}
                      disabled={isApproving}
                      className={`flex items-center px-4 py-2 text-white rounded-lg shadow transition-all cursor-pointer ${isApproving ? 'bg-green-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}`}
                    >
                      <FaCheck className="mr-2" />
                      Approve
                    </button>
                  )}
                  {selectedUser.userType === 'Counsellor' && (
                    <button
                      onClick={() => handleRejectCounsellor(selectedUser._id)}
                      disabled={isRejecting}
                      className={`flex items-center px-4 py-2 text-white rounded-lg shadow transition-all cursor-pointer ${isRejecting ? 'bg-red-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'}`}
                    >
                      <FaTimes className="mr-2" />
                      Reject
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <FaTimes size={20} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-col md:flex-row gap-8">
                {/* Left Column - Profile */}
                <div className="w-full md:w-1/3 flex flex-col items-center">
                  <div className="relative mb-4">
                    {selectedUser.additionalDetails?.image ? (
                      <img 
                        src={selectedUser.additionalDetails.image} 
                        alt="Profile" 
                        className="h-48 w-48 rounded-full object-cover border-4 border-indigo-100 shadow-lg"
                      />
                    ) : (
                      <div className="h-48 w-48 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center border-4 border-indigo-100 shadow-lg">
                        <span className="text-5xl font-bold text-indigo-500">
                          {selectedUser.firstName?.charAt(0) || selectedUser.userType?.charAt(0) || 'U'}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold text-gray-900">
                      {selectedUser.firstName} {selectedUser.lastName}
                    </h3>
                    <p className="text-indigo-600 font-medium">{selectedUser.userType}</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      selectedUser.approved === 'Verified' ? 'bg-green-100 text-green-800' : 
                      selectedUser.approved === 'Blocked' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedUser.approved || 'Active'}
                    </span>
                  </div>
                </div>

                {/* Right Column - Details */}
                <div className="w-full md:w-2/3 space-y-6">
                  {/* Contact Information */}
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <h4 className="font-semibold text-gray-700 mb-3 border-b pb-2">Contact Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{selectedUser.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">{selectedUser.mobileNumber || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Account Information */}
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <h4 className="font-semibold text-gray-700 mb-3 border-b pb-2">Account Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Created At</p>
                        <p className="font-medium">
                          {new Date(selectedUser.createdAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Last Updated</p>
                        <p className="font-medium">
                          {new Date(selectedUser.updatedAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Additional Details */}
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <h4 className="font-semibold text-gray-700 mb-3 border-b pb-2">Additional Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="font-medium">
                          {selectedUser.additionalDetails?.address || 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Date of Birth</p>
                        <p className="font-medium">
                          {selectedUser.additionalDetails?.dob ? 
                            new Date(selectedUser.additionalDetails.dob).toLocaleDateString() : 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Gender</p>
                        <p className="font-medium">
                          {selectedUser.additionalDetails?.gender || 'Not provided'}
                        </p>
                      </div>
                      {selectedUser.userType === 'Counsellor' && (
                        <div>
                          <p className="text-sm text-gray-500">Specialization</p>
                          <p className="font-medium">
                            {selectedUser.additionalDetails?.specialization || 'Not specified'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Qualifications */}
                  {selectedUser.qualification?.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <h4 className="font-semibold text-gray-700 mb-3 border-b pb-2">Qualifications</h4>
                      <div className="space-y-3">
                        {selectedUser.qualification.map((qual, index) => (
                          <div key={index} className="bg-white p-3 rounded-lg border border-gray-200 hover:shadow-md transition-all">
                            <div className="font-medium text-gray-900">{qual.courseName}</div>
                            {qual.percentage && (
                              <div className="text-sm text-gray-600 mt-1">
                                <span className="font-medium">Score:</span> {qual.percentage}%
                              </div>
                            )}
                            {qual.certificate && (
                              <a 
                                href={qual.certificate} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center mt-2 text-sm text-indigo-600 hover:text-indigo-800"
                              >
                                <FaExternalLinkAlt className="mr-1" size={12} />
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
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;