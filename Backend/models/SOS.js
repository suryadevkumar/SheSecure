import mongoose from 'mongoose';

const sosSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  reportId: { type: String, required: true, index: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  startSosTime: { type: Date, default: Date.now },
  endSosTime: { type: Date, default: null },
  lastActivity: { type: Date, default: Date.now },
});

// Add index for active SOS queries
sosSchema.index({ userId: 1, endSosTime: 1 });

// Add method to check if SOS is still active
sosSchema.methods.isActive = function() {
  return this.endSosTime === null;
};

export default mongoose.model('SOS', sosSchema);