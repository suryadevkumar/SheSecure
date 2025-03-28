import LocationHistory from '../models/LocationHistory.js';
import User from '../models/User.js';

export const saveLocationHistory = async (req, res) => {
  try {
    const { locations } = req.body;
    const userId = req.user.id; // Extract user ID from the JWT token

    console.log(userId, locations);

    if (!locations || !Array.isArray(locations) || locations.length === 0) {
      return res.status(400).json({ message: 'Invalid request data' });
    }

    let locationHistoryEntry;

    const user = await User.findById(userId).populate('locationHistory');

    if (user.locationHistory) {
      // If user already has location history, update it by adding new locations
      locationHistoryEntry = await LocationHistory.findByIdAndUpdate(
        user.locationHistory._id,
        { $push: { locations: { $each: locations } } },
        { new: true }
      );
    } else {
      // If no location history exists, create a new entry and link it to the user
      locationHistoryEntry = new LocationHistory({ locations });
      await locationHistoryEntry.save();

      // Update user's locationHistory reference
      await User.findByIdAndUpdate(userId, { locationHistory: locationHistoryEntry._id });
    }

    res.status(201).json({ message: 'Location history saved successfully' });
  } catch (error) {
    console.error('Error saving location history:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
