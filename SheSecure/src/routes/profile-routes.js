import { api } from "../config/config";

// Get user details
export const getUserDetails = async (token) => {
  const res = await fetch(`${api}/profile/get-details`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch user details");
  return res.json();
};

// Update user profile
export const updateProfile = async (token, formData) => {
  const res = await fetch(`${api}/profile/update-profile`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) throw new Error("Failed to update profile");
  return res.json();
};
