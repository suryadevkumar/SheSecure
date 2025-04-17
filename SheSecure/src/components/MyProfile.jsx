import React, { useEffect, useState } from "react";
import { getUserDetails } from "../routes/profile-routes";
import { useNavigate } from "react-router-dom";
import {
  Pencil,
  Phone,
  Calendar,
  MapPin,
  UserRoundCheck,
  BookOpenCheck,
  BadgeCheck,
  FileImage,
} from "lucide-react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

const MyProfile = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [modalImage, setModalImage] = useState(null);
  const navigate = useNavigate();
  const token = useSelector((state)=>state.auth.token);

  useEffect(() => {
    getUserDetails(token)
      .then((res) => {
        setUser(res.user);
      })
      .catch(() => toast.error("Failed to load profile"));
  }, []);

  const openImageModal = (src) => {
    setModalImage(src);
  };

  const closeImageModal = () => {
    setModalImage(null);
  };

  if (!user) return <div className="text-center py-6 text-base">Loading...</div>;

  const TabButton = ({ label, value }) => (
    <button
      className={`px-4 py-1.5 text-sm font-medium transition-all duration-200 rounded-t-lg border-b-2 cursor-pointer ${
        activeTab === value
          ? "border-blue-600 text-blue-700 bg-white"
          : "border-transparent text-gray-500 hover:text-blue-600 hover:bg-gray-50"
      }`}
      onClick={() => setActiveTab(value)}
    >
      {label}
    </button>
  );

  return (
    <>

      <div className="m-30 max-w-2xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              onClick={() =>
                openImageModal(user.additionalDetails?.image || "/avatar-placeholder.png")
              }
              src={user.additionalDetails?.image || "/avatar-placeholder.png"}
              alt="Profile"
              className="w-20 h-20 rounded-full border-4 border-blue-300 object-cover shadow cursor-pointer hover:scale-105 transition"
            />
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() =>
              activeTab === "contacts"
                ? navigate("/emergency-contacts")
                : navigate("/Profile-update")
            }
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-full flex items-center gap-1 text-sm shadow transition cursor-pointer"
          >
            <Pencil className="w-4 h-4" />
            {activeTab === "contacts" ? "Edit Emergency Contacts" : "Edit Profile"}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b bg-gray-50 px-4">
          <TabButton label="Profile Details" value="profile" />
          {user.userType === "User" && (
            <TabButton label="Emergency Contacts" value="contacts" />
          )}
          {(user.userType === "Admin" || user.userType === "Counsellor") && (
            <TabButton label="Qualification" value="qualification" />
          )}
        </div>

        {/* Tab Content */}
        <div className="p-4">
          {activeTab === "profile" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
              <div className="bg-white border rounded-lg p-3 shadow-sm hover:shadow-md transition-transform duration-200 hover:-translate-y-1">
                <Phone className="w-4 h-4 text-blue-600 mb-1" />
                <p className="text-xs text-gray-500">Mobile Number</p>
                <p className="font-medium text-sm">{user.mobileNumber}</p>
              </div>

              <div className="bg-white border rounded-lg p-3 shadow-sm hover:shadow-md transition-transform duration-200 hover:-translate-y-1">
                <UserRoundCheck className="w-4 h-4 text-blue-600 mb-1" />
                <p className="text-xs text-gray-500">Gender</p>
                <p className="font-medium text-sm">
                  {user.additionalDetails?.gender || "--"}
                </p>
              </div>

              <div className="bg-white border rounded-lg p-3 shadow-sm hover:shadow-md transition-transform duration-200 hover:-translate-y-1">
                <Calendar className="w-4 h-4 text-blue-600 mb-1" />
                <p className="text-xs text-gray-500">Date of Birth</p>
                <p className="font-medium text-sm">
                  {user.additionalDetails?.dob?.split("T")[0] || "--"}
                </p>
              </div>

              <div className="bg-white border rounded-lg p-3 shadow-sm hover:shadow-md transition-transform duration-200 hover:-translate-y-1">
                <MapPin className="w-4 h-4 text-blue-600 mb-1" />
                <p className="text-xs text-gray-500">Address</p>
                <p className="font-medium text-sm">
                  {user.additionalDetails?.address || "--"}
                </p>
              </div>

              <div className="bg-white border rounded-lg p-3 shadow-sm hover:shadow-md transition-transform duration-200 hover:-translate-y-1">
                <UserRoundCheck className="w-4 h-4 text-blue-600 mb-1" />
                <p className="text-xs text-gray-500">Account Type</p>
                <p className="font-medium text-sm">{user.userType}</p>
              </div>
            </div>
          )}

          {activeTab === "contacts" && (
            <div>
              {user.additionalDetails?.emergencyContacts?.length > 0 ? (
                <ul className="space-y-3 mt-3 ">
                  {user.additionalDetails.emergencyContacts.map((contact) => (
                    <li
                      key={contact._id}
                      className="p-3 bg-blue-50 border border-blue-200 rounded-lg shadow-sm flex items-center gap-3 hover:shadow-md transition-transform duration-200 hover:-translate-y-1"
                    >
                      <Phone className="w-4 h-4 text-blue-600" />
                      <div className="flex justify-between w-full items-center">
                        <p className="text-sm font-medium text-gray-800">{contact.name}</p>
                        <p className="text-xs font-medium text-gray-600">{contact.contactNumber}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm mt-3">No emergency contacts found.</p>
              )}
            </div>
          )}

          {activeTab === "qualification" && (
            <div>
              {user.qualification && user.qualification.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                  {user.qualification.map((q) => (
                    <div
                      key={q._id}
                      className="p-4 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition"
                    >
                      <div className="mb-3 flex items-start gap-2">
                        <BookOpenCheck className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">Course</p>
                          <p className="text-sm font-semibold text-gray-800">{q.courseName}</p>
                        </div>
                      </div>
                      <div className="mb-3 flex items-start gap-2">
                        <BadgeCheck className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">Marks</p>
                          <p className="text-sm font-medium text-gray-800">{q.marks ?? "--"}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <FileImage className="w-5 h-5 text-purple-600 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Certificate</p>
                          <img
                            onClick={() => openImageModal(q.certificate)}
                            src={q.certificate}
                            alt="Certificate"
                            className="w-full h-40 object-cover rounded shadow cursor-pointer border hover:scale-105 transition"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm mt-3">No qualifications found.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {modalImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center"
          onClick={closeImageModal}
        >
          <img
            src={modalImage}
            alt="Enlarged"
            className="max-w-3xl max-h-[90vh] rounded-xl border-4 border-white shadow-lg"
          />
        </div>
      )}
    </>
  );
};

export default MyProfile;
