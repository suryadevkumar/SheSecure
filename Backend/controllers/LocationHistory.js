import LocationHistory from '../models/LocationHistory.js';
import User from '../models/User.js';

export const saveLocationHistory = async (req, res) => {
  try {
    const { latitude, longitude, startTime, endTime } = req.body;
    const userId = req.user.id;

    // Validate the location data
    if (!latitude || !longitude || !startTime || !endTime) {
      return res.status(400).json({ message: "Invalid location data" });
    }

    // Create a new location history entry
    const newLocationHistory = new LocationHistory({
      latitude,
      longitude,
      startTime,
      endTime,
    });
    await newLocationHistory.save();

    // Find the user and update their location history array
    const user = await User.findByIdAndUpdate(
      userId,
      { $push: { locationHistory: newLocationHistory._id } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(201).json({
      message: "Location history saved successfully",
      locationHistoryId: newLocationHistory._id,
    });
  } catch (error) {
    console.error("Error saving location history:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
