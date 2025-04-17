import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateProfile, getUserDetails } from "../routes/profile-routes";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import {
  Phone,
  Calendar,
  MapPin,
  UserRoundCheck,
  Mail,
  Pencil,
  BadgeInfo,
} from "lucide-react";

const UpdateProfile = () => {
  const [formData, setFormData] = useState({
    gender: "",
    address: "",
    dob: "",
    displayPicture: null,
  });
  const [user, setUser] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const token=useSelector((state)=>state.auth.token);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getUserDetails(token);
        setUser(res.user);
        const details = res.user.additionalDetails || {};
        setFormData({
          gender: details.gender || "",
          address: details.address || "",
          dob: details.dob?.split("T")[0] || "",
          displayPicture: null,
        });
      } catch {
        toast.error("Failed to load profile data");
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "displayPicture" ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) data.append(key, value);
    });
    try {
      const res=await updateProfile(token, data);
      toast.success(res.message);
      navigate("/profile");
    } catch {
      toast.error("Failed to update profile");
    }
  };

  if (!user)
    return <div className="text-center mt-32 text-base text-gray-600">Loading...</div>;

  const isGenderSet = !!user.additionalDetails?.gender;

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl mx-auto mt-30 bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4 relative">
        <div className="flex items-center gap-6 relative">
          <div className="relative w-20 h-20 group">
            <img
              src={
                formData.displayPicture
                  ? URL.createObjectURL(formData.displayPicture)
                  : user.additionalDetails?.image || "/avatar-placeholder.png"
              }
              alt="Profile"
              className="w-20 h-20 rounded-full border-4 border-blue-300 object-cover shadow transition duration-300 group-hover:scale-105"
            />
            <label className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow cursor-pointer hover:bg-blue-50 transition">
              <Pencil className="w-4 h-4 text-blue-600" />
              <input
                type="file"
                name="displayPicture"
                accept="image/*"
                onChange={handleChange}
                className="hidden"
              />
            </label>
          </div>
          <div className="flex flex-col justify-center space-y-0.5">
            <h1 className="text-xl font-bold text-gray-800 text-left">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-sm text-gray-500 text-left">{user.email}</p>
          </div>
        </div>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm shadow transition-all duration-200 hover:scale-105 hover:shadow-md cursor-pointer"
        >
          Save Changes
        </button>
      </div>

      {/* Editable Form Fields */}
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
        {/* Gender */}
        <div className="bg-white border rounded-lg p-3 shadow-sm hover:shadow-md transition-transform duration-200 hover:-translate-y-1">
          <UserRoundCheck className="w-4 h-4 text-blue-600 mb-1" />
          <p className="text-xs text-gray-500 mb-1">Gender</p>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            disabled={isGenderSet}
            className={`w-full border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none ${
              isGenderSet
                ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                : "focus:ring-2 focus:ring-blue-200 cursor-pointer"
            }`}
          >
            <option value="">Select</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Address */}
        <div className="bg-white border rounded-lg p-3 shadow-sm hover:shadow-md transition-transform duration-200 hover:-translate-y-1">
          <MapPin className="w-4 h-4 text-blue-600 mb-1" />
          <p className="text-xs text-gray-500 mb-1">Address</p>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>

        {/* Date of Birth */}
        <div className="bg-white border rounded-lg p-3 shadow-sm hover:shadow-md transition-transform duration-200 hover:-translate-y-1">
          <Calendar className="w-4 h-4 text-blue-600 mb-1" />
          <p className="text-xs text-gray-500 mb-1">Date of Birth</p>
          <input
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer"
          />
        </div>

        {/* Mobile Number */}
        <div className="bg-white border rounded-lg p-3 shadow-sm hover:shadow-md transition-transform duration-200 hover:-translate-y-1">
          <Phone className="w-4 h-4 text-blue-600 mb-1" />
          <p className="text-xs text-gray-500">Mobile Number</p>
          <p className="text-sm font-medium">{user.mobileNumber}</p>
        </div>

        {/* User Type */}
        <div className="bg-white border rounded-lg p-3 shadow-sm hover:shadow-md transition-transform duration-200 hover:-translate-y-1">
          <BadgeInfo className="w-4 h-4 text-blue-600 mb-1" />
          <p className="text-xs text-gray-500">Account Type</p>
          <p className="text-sm font-medium">{user.userType}</p>
        </div>
      </div>
    </form>
  );
};

export default UpdateProfile;
