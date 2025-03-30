import mongoose from 'mongoose';

const sosSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  reportId: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  startSosTime: { type: Date, default: Date.now },
  endSosTime: { type: Date, default: null },
});

export default mongoose.model('SOS', sosSchema);
