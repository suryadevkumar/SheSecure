import { api } from "../config/config";

// Get Emergency Contacts
export const getEmergencyContacts = async (token) => {
  const res = await fetch(`${api}/emergency-contacts/get`, {
    method: "GET",
    credentials: 'include',
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });

  if (!res.ok) throw new Error("Failed to fetch contacts");
  return res.json();
};

// Add Emergency Contact
export const addEmergencyContact = async (token, contact) => {
  const res = await fetch(`${api}/emergency-contacts/add`, {
    method: "POST",
    credentials: 'include',
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(contact),
  });

  if (!res.ok) throw new Error("Failed to add contact");
  return res.json();
};

// Update Emergency Contact
export const updateEmergencyContact = async (token, contactId, updatedData) => {
  const res = await fetch(`${api}/emergency-contacts/update/${contactId}`, {
    method: "PUT",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(updatedData),
  });

  if (!res.ok) throw new Error("Failed to update contact");
  return res.json();
};

// Remove Emergency Contact
export const removeEmergencyContact = async (token, contactId) => {
  const res = await fetch(`${api}/emergency-contacts/remove/${contactId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) throw new Error("Failed to delete contact");
  return res.json();
};
