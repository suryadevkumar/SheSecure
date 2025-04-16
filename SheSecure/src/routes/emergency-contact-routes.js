// src/routes/emergencyContacts.js
import { api } from "../config/config";

// Helpers
const getToken = () => localStorage.getItem("token");

const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

// ✅ Get Emergency Contacts
export const getEmergencyContacts = async () => {
  const res = await fetch(`${api}/emergency-contacts/get`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!res.ok) throw new Error("Failed to fetch contacts");
  return res.json();
};

// ✅ Add Emergency Contact
export const addEmergencyContact = async (contact) => {
  const res = await fetch(`${api}/emergency-contacts/add`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(contact),
  });

  if (!res.ok) throw new Error("Failed to add contact");
  return res.json();
};

// ✅ Update Emergency Contact
export const updateEmergencyContact = async (contactId, updatedData) => {
  const res = await fetch(`${api}/emergency-contacts/update/${contactId}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(updatedData),
  });

  if (!res.ok) throw new Error("Failed to update contact");
  return res.json();
};

// ✅ Remove Emergency Contact
export const removeEmergencyContact = async (contactId) => {
  const res = await fetch(`${api}/emergency-contacts/remove/${contactId}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  if (!res.ok) throw new Error("Failed to delete contact");
  return res.json();
};
