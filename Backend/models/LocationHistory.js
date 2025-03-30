import mongoose from "mongoose";

const locationSchema = mongoose.Schema({
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
}, { timestamps: true });

export default mongoose.model("LocationHistory", locationSchema);
