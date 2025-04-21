import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const AdminManagement = () => {
  const [selectedCategory, setSelectedCategory] = useState('Admin Request');
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  // Fetch admins data
  const { data: admins, isLoading, error } = useQuery({
    queryKey: ['admins'],
    queryFn: async () => {
      const response = await axios.get('/api/superadmin/getall/admin', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.data.admins;
    }
  });

  // Filter admins based on category
  const filteredAdmins = admins?.filter(admin => {
    if (selectedCategory === 'Admin Request') return !admin.isApproved;
    if (selectedCategory === 'Verified Admins') return admin.isApproved;
    return true; // All Admins
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Category Filter */}
      <div className="flex gap-4 mb-8 border-b pb-4">
        {['Admin Request', 'Verified Admins', 'All Admins'].map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Admin Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAdmins?.map(admin => (
          <AdminCard 
            key={admin._id} 
            admin={admin}
            onSelect={() => setSelectedAdmin(admin)}
          />
        ))}
      </div>

      {/* Admin Detail Modal */}
      {selectedAdmin && (
        <AdminDetailModal
          admin={selectedAdmin}
          onClose={() => setSelectedAdmin(null)}
        />
      )}
    </div>
  );
};

// Admin Card Component
const AdminCard = ({ admin, onSelect }) => (
  <div 
    onClick={onSelect}
    className="border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
  >
    <div className="flex items-center gap-4">
      <img 
        src={admin.additionalDetails?.image || '/default-avatar.png'} 
        alt={admin.name}
        className="w-16 h-16 rounded-full object-cover"
      />
      <div>
        <h3 className="font-semibold text-lg">{admin.name}</h3>
        <p className="text-gray-600">{admin.email}</p>
        {!admin.isApproved && (
          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
            Pending Approval
          </span>
        )}
      </div>
    </div>
  </div>
);

// Admin Detail Modal Component
const AdminDetailModal = ({ admin, onClose }) => {
  const handleApprove = async () => {
    try {
      await axios.put(`/api/superadmin/approve/${admin._id}`, null, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      onClose();
      // You might want to invalidate the query here
    } catch (error) {
      console.error('Approval failed:', error);
    }
  };

  const handleReject = async () => {
    try {
      await axios.delete(`/api/superadmin/reject/${admin._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      onClose();
      // You might want to invalidate the query here
    } catch (error) {
      console.error('Rejection failed:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold">{admin.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-4">
          <img
            src={admin.additionalDetails?.image || '/default-avatar.png'}
            alt={admin.name}
            className="w-32 h-32 rounded-full mx-auto"
          />
          <p><strong>Email:</strong> {admin.email}</p>
          <p><strong>Qualification:</strong> {admin.qualification?.name}</p>
          {/* Add more fields as needed */}
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            Back
          </button>
          <button
            onClick={handleReject}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Reject Admin
          </button>
          <button
            onClick={handleApprove}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Approve Admin
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminManagement;