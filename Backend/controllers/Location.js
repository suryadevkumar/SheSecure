import Location from '../models/Location.js';
import Profile from '../models/Profile.js';
import User from '../models/User.js';

export const saveLocation = async (req, res) => {
  try {
    const { latitude, longitude, startTime, endTime, userId } = req.body;

    // Validate the location data
    if (!latitude || !longitude || !startTime || !endTime) {
      return res.status(400).json({ message: "Invalid location data" });
    }

    // Create a new location entry
    const newLocation = new Location({
      latitude,
      longitude,
      startTime,
      endTime,
    });
    await newLocation.save();

    // Find the user's profile using the additionalDetails field
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const profileId = user.additionalDetails;
    if (!profileId) {
      return res.status(404).json({ message: "Profile not found for this user" });
    }

    // Update the Profile schema to add the new location
    await Profile.findByIdAndUpdate(
      profileId,
      { $push: { location: newLocation._id } },
      { new: true }
    );

    res.status(201).json({
      message: "Location saved successfully",
      locationId: newLocation._id,
    });
  } catch (error) {
    console.error("Error saving location history:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
