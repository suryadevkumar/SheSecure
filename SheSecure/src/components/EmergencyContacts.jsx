import React, { useEffect, useState } from "react";
import { getEmergencyContacts, addEmergencyContact, updateEmergencyContact, removeEmergencyContact } from "../routes/emergency-contact-routes";
import { toast } from "react-toastify";
import { Trash2, Pencil, Phone, User, UserPlus, RefreshCcw } from "lucide-react";
import { useSelector } from "react-redux";

const EmergencyContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [formData, setFormData] = useState({ name: "", contactNumber: "" });
  const [isEditing, setIsEditing] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const [error, setError] = useState("");
  const token = useSelector((state) => state.auth.token);

  const fetchContacts = async () => {
    try {
      const res = await getEmergencyContacts(token);
      setContacts(res.contacts);
    } catch {
      toast.error("Error loading contacts");
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.contactNumber)) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }
    setError("");

    try {
      if (isEditing) {
        await updateEmergencyContact(token, isEditing, formData);
        toast.success("Contact updated");
      } else {
        await addEmergencyContact(token, formData);
        toast.success("Contact added");
      }
      setFormData({ name: "", contactNumber: "" });
      setIsEditing(null);
      fetchContacts();
    } catch {
      toast.error("Operation failed");
    }
  };

  const handleEdit = (contact) => {
    setFormData({ name: contact.name, contactNumber: contact.contactNumber });
    setIsEditing(contact._id);
    setError("");
  };

  const handleCancelEdit = () => {
    setFormData({ name: "", contactNumber: "" });
    setIsEditing(null);
    setError("");
  };

  const confirmDelete = (id) => {
    setShowConfirm(true);
    setPendingDeleteId(id);
  };

  const cancelDelete = () => {
    setShowConfirm(false);
    setPendingDeleteId(null);
  };

  const handleConfirmDelete = async () => {
    try {
      await removeEmergencyContact(token, pendingDeleteId);
      toast.success("Contact deleted");
      fetchContacts();
    } catch {
      toast.error("Failed to delete contact");
    } finally {
      setShowConfirm(false);
      setPendingDeleteId(null);
    }
  };

  return (
    <div className="mt-10 max-w-4xl mx-auto p-6 rounded-2xl shadow-xl bg-white min-h-[80vh] flex flex-col animate-fade-in transition-all duration-500 ease-in-out">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Emergency Contacts
      </h2>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="grid gap-4 sm:grid-cols-2 items-center mb-8 transition-all duration-500 ease-out transform hover:scale-[1.01]"
      >
        <input
          type="text"
          placeholder="Contact Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="border border-gray-300 px-4 py-2 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
          required
        />
        <input
          type="tel"
          placeholder="Phone Number"
          value={formData.contactNumber}
          onChange={(e) =>
            setFormData({ ...formData, contactNumber: e.target.value })
          }
          className={`border px-4 py-2 rounded-xl shadow-sm focus:outline-none transition duration-300 ${
            error
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-blue-500"
          }`}
          required
        />
        {error && (
          <p className="text-red-500 text-sm mt-1 col-span-full animate-pulse">
            {error}
          </p>
        )}

        <div className="col-span-full flex gap-4 justify-center">
          <button
            type="submit"
            className={`flex items-center gap-2 px-6 py-2 rounded-full text-white font-medium transition-all duration-300 ease-in-out transform hover:scale-105 cursor-pointer ${
              isEditing
                ? "bg-yellow-500 hover:bg-yellow-600"
                : "bg-blue-600 hover:bg-blue-700"
            } shadow-md`}
          >
            {isEditing ? (
              <>
                Update Contact <RefreshCcw className="w-5 h-5 animate-spin" />
              </>
            ) : (
              <>
                Add Contact <UserPlus className="w-5 h-5" />
              </>
            )}
          </button>

          {isEditing && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-12 py-2 rounded-full bg-red-500 text-white font-medium border border-red-500 hover:bg-red-700 transition duration-300 shadow-md cursor-pointer"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Contact List */}
      <div className="space-y-4">
        {contacts.length > 0 ? (
          contacts.map((contact) => (
            <div
              key={contact._id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-blue-50 border border-blue-200 p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:scale-[1.01]"
            >
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full shadow-sm">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-800">
                    {contact.name}
                  </p>
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <Phone className="w-4 h-4" />
                    {contact.contactNumber}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleEdit(contact)}
                  className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition transform hover:scale-110 cursor-pointer"
                >
                  <Pencil className="w-4 h-4 text-blue-600" />
                </button>
                <button
                  onClick={() => confirmDelete(contact._id)}
                  className={`p-2 rounded-full transition transform hover:scale-110 cursor-pointer ${
                    isEditing
                      ? "cursor-not-allowed opacity-50"
                      : "hover:bg-red-200 bg-red-100"
                  }`}
                  disabled={isEditing}
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center">
            No emergency contacts found.
          </p>
        )}
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-transparent bg-opacity-10 backdrop-blur-lg flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-[90%] max-w-md text-center animate-fade-in">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Are you sure?
            </h3>
            <p className="text-gray-600 mb-6">
              This will permanently delete the contact.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-full font-medium bg-red-600 text-white hover:bg-red-700 transition cursor-pointer"
              >
                Yes, Delete
              </button>
              <button
                onClick={cancelDelete}
                className="px-4 py-2 rounded-full border font-medium border-gray-300 text-gray-700 hover:bg-gray-100 transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyContacts;
