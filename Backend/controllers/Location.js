import Location from '../models/Location.js';
import Profile from '../models/Profile.js';
import User from '../models/User.js';

export const saveLocation = async (req, res) => {
  try {
    const userId = req.user._id;
    const { latitude, longitude, displayName, formattedAddress, startTime, endTime } = req.body;

    // Validate the location data
    if (!latitude || !longitude || !startTime || !endTime) {
      return res.status(400).json({ message: "Invalid location data" });
    }

    // Create a new location entry
    const newLocation = new Location({
      latitude,
      longitude,
      displayName,
      formattedAddress,
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

export const fetchLocationHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { date } = req.query; // Destructure the date from query params

    // Validate required parameters
    if (!userId) {
      return res.status(400).json({ 
        message: "User ID is required" 
      });
    }

    if (!date) {
      return res.status(400).json({ 
        message: "Date parameter is required (YYYY-MM-DD format)" 
      });
    }

    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ 
        message: "Invalid date format. Please use YYYY-MM-DD format" 
      });
    }

    // Create Date object with UTC time to avoid timezone issues
    const searchDate = new Date(`${date}T00:00:00Z`);
    if (isNaN(searchDate.getTime())) {
      return res.status(400).json({ 
        message: "Invalid date" 
      });
    }

    // Calculate start and end of the day in UTC
    const startOfDay = new Date(searchDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    
    const endOfDay = new Date(searchDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    // Find user and populate location history
    const user = await User.findById(userId)
    .populate({
      path: 'additionalDetails',
      populate: {
        path: 'location',
        match: {
          $or: [
            { 
              startTime: { $gte: startOfDay, $lte: endOfDay } 
            },
            { 
              endTime: { $gte: startOfDay, $lte: endOfDay } 
            },
            { 
              $and: [
                { startTime: { $lte: startOfDay } },
                { endTime: { $gte: endOfDay } }
              ]
            }
          ]
        },
        options: { sort: { startTime: 1 } }
      }
    }).lean(); // Use lean() for better performance
    
    if (!user) {
      return res.status(404).json({ 
        message: "User not found" 
      });
    }

    if (!user.additionalDetails?.location || user.additionalDetails.location.length === 0) {
      return res.status(200).json({ 
        message: "No location history found for the specified date",
        data: [] 
      });
    }

    res.status(200).json({ 
      message: "Location history fetched successfully",
      data: user.additionalDetails.location 
    });

  } catch (error) {
    console.error("Error fetching location history:", error);
    res.status(500).json({ 
      message: "Internal server error",
      error: error.message 
    });
  }
};