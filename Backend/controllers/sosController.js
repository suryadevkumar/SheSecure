import SOS from '../models/SOS.js';
import LocationHistory from '../models/LocationHistory.js';

export const startSOS = async (req, res) => {
  const { reportId, latitude, longitude } = req.body;
  const userId = req.user.id;

  try {
    const sos = new SOS({
      reportId,
      userId,
      latitude,
      longitude,
      startSosTime: new Date(),
      endSosTime: null,
    });

    await sos.save();

    res.status(201).json({ success: true, message: 'SOS started successfully', sos });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to start SOS', error });
  }
};

export const endSOS = async (req, res) => {
  const { reportId } = req.body;

  try {
    // Directly find and update the SOS record by reportId
    const sos = await SOS.findOneAndUpdate({ reportId },{ endSosTime: new Date() },{ new: true });

    if (!sos) {
      return res.status(404).json({ success: false, message: 'No SOS found with this reportId' });
    }

    res.status(200).json({ success: true, message: 'SOS ended successfully', sos });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to end SOS', error });
  }
};

export const checkSOSStatus = async (req, res) => {
  const { reportId } = req.params;

  try {
    const sos = await SOS.findOne({ reportId });

    if (!sos) {
      return res.status(404).json({ success: false, message: 'No SOS found with this reportId' });
    }

    // Check if SOS is active or deactivated
    const isActive = sos.endSosTime === null;
    res.status(200).json({ success: true, isActive });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to check SOS status', error });
  }
};

export const fetchLiveLocation = async (req, res) => {
  const { reportId } = req.params;

  try {
    const sos = await SOS.findOne({ reportId });

    if (!sos) {
      return res.status(404).json({ success: false, message: 'No SOS found with this reportId' });
    }

    // Fetch live location data from the start of SOS to now
    const locationHistory = await LocationHistory.find({
      userId: sos.userId,
      'locations.startTime': { $gte: sos.startSosTime },
    });

    res.status(200).json({ success: true, sos, locationHistory });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch live location', error });
  }
};


export const fetchHistoryLocation = async (req, res) => {
  const { reportId } = req.params;

  try {
    const sos = await SOS.findOne({ reportId });

    if (!sos) {
      return res.status(404).json({ success: false, message: 'No SOS found with this reportId' });
    }

    // Calculate the time 5 hours before the endSosTime
    const fiveHoursAgo = new Date(new Date(sos.endSosTime).getTime() - 5 * 60 * 60 * 1000);

    // Fetch location history for the last 5 hours before the end time
    const locationHistory = await LocationHistory.find({
      userId: sos.userId,
      'locations.startTime': { $gte: fiveHoursAgo, $lte: sos.endSosTime },
    });

    res.status(200).json({ success: true, sos, locationHistory });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch location history', error });
  }
};