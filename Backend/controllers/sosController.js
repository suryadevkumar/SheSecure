import SOS from '../models/SOS.js';
import User from '../models/User.js';

export const startSOS = async (req, res) => {
  const { reportId, latitude, longitude } = req.body;
  const userId = req.user.id;

  try {
    // End any existing active SOS for this user
    await SOS.updateMany(
      { userId, endSosTime: null },
      { endSosTime: new Date() }
    );

    const sos = new SOS({
      reportId,
      userId,
      latitude,
      longitude,
      startSosTime: new Date(),
      endSosTime: null,
    });

    await sos.save();

    if (!global.activeSOS) global.activeSOS = {};
    global.activeSOS[reportId] = {
      locations: [],
      userId,
      startTime: sos.startSosTime
    };

    res.status(201).json({ 
      success: true, 
      message: 'SOS started successfully', 
      sos,
      link: `http://yourdomain.com/emergency-sos/?reportId=${reportId}`
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to start SOS', 
      error: error.message 
    });
  }
};

export const endSOS = async (req, res) => {
  const { reportId } = req.body;
  const userId = req.user?.id;

  try {
    const sos = await SOS.findOneAndUpdate(
      { reportId, ...(userId ? { userId } : {}) },
      { endSosTime: new Date() },
      { new: true }
    );

    if (!sos) {
      return res.status(404).json({ 
        success: false, 
        message: 'No active SOS found with this reportId' 
      });
    }

    if (global.activeSOS?.[reportId]) {
      delete global.activeSOS[reportId];
    }

    res.status(200).json({ 
      success: true, 
      message: 'SOS ended successfully', 
      sos 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to end SOS', 
      error: error.message 
    });
  }
};

export const fetchSosLocation = async (req, res) => {
  try {
    const { reportId } = req.body;
    
    // Find the SOS record
    const sosRecord = await SOS.findOne({ reportId });
    if (!sosRecord) {
      return res.status(404).json({ 
        success: false,
        message: "Invalid SOS link" 
      });
    }

    const { userId, startSosTime, endSosTime } = sosRecord;

    // Determine SOS status
    const sosStatus = endSosTime ? "inactive" : "active";

    // Define time conditions for location history
    let locationTimeCondition;
    if (sosStatus === "active") {
      locationTimeCondition = { startTime: { $gte: startSosTime } };
    } else {
      const endTime = endSosTime || new Date();
      const start24HoursAgo = new Date(endTime - 5 * 60 * 60 * 1000);
      locationTimeCondition = { startTime: { $gte: start24HoursAgo, $lte: endTime } };
    }

    // Fetch user with location history based on the time condition
    const user = await User.findById(userId)
      .populate({
        path: 'locationHistory',
        match: locationTimeCondition,
        options: { sort: { startTime: 1 } }
      });

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // Get live locations from active SOS if available
    const liveLocations = global.activeSOS?.[reportId]?.locations || [];

    // Send the response
    res.json({
      success: true,
      status: sosStatus,
      locationHistory: user.locationHistory,
      liveLocations,
      startSosTime,
      endSosTime
    });

  } catch (error) {
    console.error("Error fetching SOS data:", error);
    res.status(500).json({ 
      success: false,
      error: "Error fetching SOS data" 
    });
  }
};
