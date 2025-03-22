import { v4 as uuidv4 } from 'uuid';
import SOS from '../models/SOS.js';
import { errorHandler } from '../utils/errorHandlers.js';

export const startSOS = async (req, res) => {
  const reportId = uuidv4();
  const userId = req.session.userId;

  try {
    const sos = new SOS({ reportId, userId, latitude: 0, longitude: 0 });
    await sos.save();
    res.json({ reportId });
  } catch (err) {
    errorHandler(res, 500, 'Failed to start SOS', err);
  }
};

export const updateLocation = async (req, res) => {
  const { reportId, latitude, longitude } = req.body;
  try {
    await SOS.findOneAndUpdate({ reportId }, { latitude, longitude, timestamp: Date.now() });
    res.send('Location updated');
  } catch (err) {
    errorHandler(res, 500, 'Failed to update location', err);
  }
};

export const getLiveLocation = async (req, res) => {
  const { reportId } = req.query;
  try {
    const sos = await SOS.findOne({ reportId }).sort({ timestamp: -1 });
    if (sos) {
      res.json({ latitude: sos.latitude, longitude: sos.longitude });
    } else {
      res.status(404).json({ error: 'Location not found' });
    }
  } catch (err) {
    errorHandler(res, 500, 'Failed to get location', err);
  }
};