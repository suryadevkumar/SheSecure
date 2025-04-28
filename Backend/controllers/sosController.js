import SOS from '../models/SOS.js';
import User from '../models/User.js';
import twilio from 'twilio';
import dotenv from 'dotenv';
dotenv.config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);


export const startSOS = async (req, res) => {
  const { reportId, latitude, longitude, userId } = req.body;

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

    // Store session information as well
    if (req.session) {
      if (!req.session.activeSOS) req.session.activeSOS = {};
      req.session.activeSOS[userId] = reportId;
      await req.session.save();
    }

    // Create shareable link
    const sosLink = `${process.env.FRONTEND_URL }/emergency-sos/?reportId=${reportId}`;

    res.status(201).json({
      success: true,
      message: 'SOS started successfully',
      sos,
      link: sosLink
    });
  } catch (error) {
    console.error("Start SOS error:", error);
    res.status(500).json({
      success: false,
      message: 'Failed to start SOS',
      error: error.message
    });
  }
};

export const endSOS = async (req, res) => {
  const { reportId, userId } = req.body;

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

    // Clear session data
    if (req.session && req.session.activeSOS && userId) {
      delete req.session.activeSOS[userId];
      await req.session.save();
    }

    res.status(200).json({
      success: true,
      message: 'SOS ended successfully',
      sos
    });
  } catch (error) {
    console.error("End SOS error:", error);
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
      const start24HoursAgo = new Date(endTime - 24 * 60 * 60 * 1000);
      locationTimeCondition = { startTime: { $gte: start24HoursAgo, $lte: endTime } };
    }

    // Fetch user with location history based on the time condition
    const user = await User.findById(userId)
      .populate({
        path: 'additionalDetails',
        populate: {
          path: 'location',
          match: locationTimeCondition,
          options: { sort: { startTime: 1 } }
        }
      });

    if (!user || !user.additionalDetails) {
      return res.status(404).json({
        success: false,
        message: "User profile not found"
      });
    }

    // Get live locations from active SOS if available
    const liveLocations = global.activeSOS?.[reportId]?.locations || [];

    // Send the response
    res.json({
      success: true,
      status: sosStatus,
      locationHistory: user.additionalDetails.location || [],
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

// New endpoint to check if a user has an active SOS
export const checkActiveSOSForUser = async (req, res) => {
  const { userId } = req.body;

  try {
    // Check database for active SOS
    const activeSOS = await SOS.findOne({
      userId,
      endSosTime: null
    });

    if (!activeSOS) {
      return res.json({
        isActive: false
      });
    }

    // Create shareable link
    const sosLink = `${process.env.FRONTEND_URL}/emergency-sos/?reportId=${activeSOS.reportId}`;

    // Initialize global state if needed
    if (!global.activeSOS) global.activeSOS = {};
    if (!global.activeSOS[activeSOS.reportId]) {
      global.activeSOS[activeSOS.reportId] = {
        locations: [],
        userId,
        startTime: activeSOS.startSosTime
      };
    }

    res.json({
      isActive: true,
      reportId: activeSOS.reportId,
      sosLink
    });
  } catch (error) {
    console.error("Error checking active SOS:", error);
    res.status(500).json({
      success: false,
      message: "Error checking active SOS",
      error: error.message
    });
  }
};

// KeepAlive endpoint to ensure SOS remains active
export const keepAlive = async (req, res) => {
  const { reportId } = req.body;

  try {
    // Verify SOS exists and is active
    const sos = await SOS.findOne({ reportId, endSosTime: null });

    if (!sos) {
      return res.status(404).json({
        success: false,
        message: "No active SOS found with this reportId"
      });
    }

    // Update last activity timestamp
    sos.lastActivity = new Date();
    await sos.save();

    res.json({
      success: true,
      message: "SOS session kept alive"
    });
  } catch (error) {
    console.error("Error in keepAlive:", error);
    res.status(500).json({
      success: false,
      message: "Failed to keep SOS alive",
      error: error.message
    });
  }
};

export const sendLink = async (req, res) => {
  try {
    const { contacts, link_type, origin, link_id } = req.body;
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let message;
    if (link_type === "SOS") {
      message = `Emergency Alert: ${user.firstName} ${user.lastName} needs help!
      Phone: ${user.mobileNumber}
      Track their live location here: ${origin}/emergency-sos/?reportId=${link_id}
      Please respond immediately.`;
    } else {
      message = `Live Location Update:
      ${user.firstName} ${user.lastName}'s latest location:
      Phone: ${user.mobileNumber}
      Track here: ${origin}/live-location/?shareId=${link_id}
      Stay connected for further updates.`;
    }

    console.log(message, contacts);

    for (let number of contacts) {
      const phoneNumber= "+91"+number
      try {
        const response = await client.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phoneNumber
        });
        console.log(`Message sent to ${phoneNumber}: SID ${response.sid}`);
      } catch (error) {
        console.error(`Failed to send message to ${phoneNumber}: ${error.message}`);
      }
    }

    res.status(200).json({ message: "Messages sent successfully" });

  } catch (error) {
    console.error("Error in sendLink:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
