import { useState, useEffect } from 'react';
import { FaUserShield, FaTrash, FaCheck, FaTimes, FaChartLine, FaBell, FaShieldAlt, FaMapMarkerAlt } from 'react-icons/fa';

const SuperAdminDashboard = () => {
  // State for admin requests and other data
  const [adminRequests, setAdminRequests] = useState([]);
  const [verifiedAdmins, setVerifiedAdmins] = useState([]);
  const [activeSOS, setActiveSOS] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 1250,
    activeAdmins: 24,
    resolvedSOS: 189,
    pendingRequests: 8
  });
  const [selectedTab, setSelectedTab] = useState('requests');

  // Mock data - replace with API calls in real implementation
  useEffect(() => {
    // Simulate API fetch
    const fetchData = async () => {
      // Admin requests data
      const mockRequests = [
        { id: 1, name: 'Priya Sharma', email: 'priya@example.com', submitted: '2023-05-15', documents: 'verified' },
        { id: 2, name: 'Ananya Patel', email: 'ananya@example.com', submitted: '2023-05-18', documents: 'pending' },
        { id: 3, name: 'Neha Gupta', email: 'neha@example.com', submitted: '2023-05-20', documents: 'verified' },
      ];

      // Verified admins data
      const mockVerified = [
        { id: 101, name: 'Admin One', email: 'admin1@example.com', verifiedOn: '2023-01-15', status: 'active' },
        { id: 102, name: 'Admin Two', email: 'admin2@example.com', verifiedOn: '2023-02-20', status: 'active' },
      ];

      // Active SOS alerts
      const mockSOS = [
        { id: 1001, user: 'User A', location: 'Mumbai', time: '10:25 AM', status: 'active' },
        { id: 1002, user: 'User B', location: 'Delhi', time: '11:40 AM', status: 'active' },
      ];

      setAdminRequests(mockRequests);
      setVerifiedAdmins(mockVerified);
      setActiveSOS(mockSOS);
    };

    fetchData();
  }, []);

  // Function to verify an admin
  const verifyAdmin = (id) => {
    const request = adminRequests.find(req => req.id === id);
    if (request) {
      setVerifiedAdmins([...verifiedAdmins, {
        id,
        name: request.name,
        email: request.email,
        verifiedOn: new Date().toISOString().split('T')[0],
        status: 'active'
      }]);
      setAdminRequests(adminRequests.filter(req => req.id !== id));
    }
  };

  // Function to reject an admin request
  const rejectAdmin = (id) => {
    setAdminRequests(adminRequests.filter(req => req.id !== id));
  };

  // Function to delete an admin
  const deleteAdmin = (id) => {
    setVerifiedAdmins(verifiedAdmins.filter(admin => admin.id !== id));
  };

  // Function to resolve an SOS alert
  const resolveSOS = (id) => {
    setActiveSOS(activeSOS.filter(alert => alert.id !== id));
    setStats(prev => ({
      ...prev,
      resolvedSOS: prev.resolvedSOS + 1
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-indigo-800 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center">
            <FaShieldAlt className="mr-2" /> Women Safety Portal
          </h1>
          <div className="flex items-center space-x-4">
            <button className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-md flex items-center">
              <FaBell className="mr-2" /> Notifications
            </button>
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
              <span className="font-bold">SA</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto p-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                <FaUserShield size={20} />
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
                <FaChartLine size={20} />
              </div>
              <div>
                <p className="text-gray-500">Resolved SOS</p>
                <h3 className="text-2xl font-bold">{stats.resolvedSOS}</h3>
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

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setSelectedTab('requests')}
              className={`px-6 py-3 font-medium ${selectedTab === 'requests' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
            >
              Admin Requests
            </button>
            <button
              onClick={() => setSelectedTab('admins')}
              className={`px-6 py-3 font-medium ${selectedTab === 'admins' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
            >
              Verified Admins
            </button>
            <button
              onClick={() => setSelectedTab('sos')}
              className={`px-6 py-3 font-medium ${selectedTab === 'sos' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
            >
              Active SOS Alerts
            </button>
          </div>
        </div>

        {/* Content based on selected tab */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {selectedTab === 'requests' && (
            <div>
              <div className="p-4 border-b">
                <h2 className="text-xl font-semibold">Pending Admin Requests</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documents</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {adminRequests.map((request) => (
                      <tr key={request.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <span className="text-indigo-600 font-medium">{request.name.charAt(0)}</span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{request.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.submitted}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${request.documents === 'verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {request.documents}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => verifyAdmin(request.id)}
                            className="text-green-600 hover:text-green-900 mr-4"
                            title="Verify Admin"
                          >
                            <FaCheck />
                          </button>
                          <button
                            onClick={() => rejectAdmin(request.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Reject Request"
                          >
                            <FaTimes />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {selectedTab === 'admins' && (
            <div>
              <div className="p-4 border-b">
                <h2 className="text-xl font-semibold">Verified Admins</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verified On</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {verifiedAdmins.map((admin) => (
                      <tr key={admin.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                              <span className="text-green-600 font-medium">{admin.name.charAt(0)}</span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{admin.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{admin.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{admin.verifiedOn}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {admin.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => deleteAdmin(admin.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Admin"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {selectedTab === 'sos' && (
            <div>
              <div className="p-4 border-b">
                <h2 className="text-xl font-semibold">Active SOS Alerts</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {activeSOS.map((alert) => (
                      <tr key={alert.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                              <span className="text-red-600 font-medium">{alert.user.charAt(0)}</span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{alert.user}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <FaMapMarkerAlt className="text-red-500 mr-1" />
                            {alert.location}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{alert.time}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            {alert.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => resolveSOS(alert.id)}
                            className="bg-indigo-600 text-white px-3 py-1 rounded-md hover:bg-indigo-700 flex items-center"
                          >
                            <FaCheck className="mr-1" /> Resolve
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;