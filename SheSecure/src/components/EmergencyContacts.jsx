import React, { useEffect, useState } from "react";
import {
  getEmergencyContacts,
  addEmergencyContact,
  updateEmergencyContact,
  removeEmergencyContact,
} from "../routes/emergency-contact-routes";
import { toast } from "react-toastify";
import {
  Trash2,
  Pencil,
  Phone,
  User,
  UserPlus,
  RefreshCcw,
} from "lucide-react";

const EmergencyContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [formData, setFormData] = useState({ name: "", contactNumber: "" });
  const [isEditing, setIsEditing] = useState(null);
  const [error, setError] = useState("");

  const fetchContacts = async () => {
    try {
      const res = await getEmergencyContacts();
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
        await updateEmergencyContact(isEditing, formData);
        toast.success("Contact updated");
      } else {
        await addEmergencyContact(formData);
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

  const handleDelete = async (id) => {
    try {
      await removeEmergencyContact(id);
      toast.success("Contact deleted");
      fetchContacts();
    } catch {
      toast.error("Failed to delete contact");
    }
  };

  return (
    <div className="mt-30 max-w-4xl mx-auto p-6 rounded-2xl shadow-xl bg-white min-h-[80vh] flex flex-col animate-fade-in transition-all duration-500 ease-in-out">
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
          onChange={(e) =>
            setFormData({ ...formData, name: e.target.value })
          }
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

        <button
          type="submit"
          className={`col-span-full flex items-center justify-center gap-2 px-6 py-2 rounded-full text-white font-medium transition-all duration-300 ease-in-out transform hover:scale-105 ${
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
                  className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition transform hover:scale-110"
                >
                  <Pencil className="w-4 h-4 text-blue-600" />
                </button>
                <button
                  onClick={() => handleDelete(contact._id)}
                  className="p-2 rounded-full bg-red-100 hover:bg-red-200 transition transform hover:scale-110"
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
    </div>
  );
};

export default EmergencyContacts;
