import mongoose from "mongoose";

const chatRequestSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    problemType: {
      type: String,
      required: true,
      trim: true
    },
    brief: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Completed'],
      default: 'Pending'
    },
    acceptedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  }, { timestamps: true });

export default mongoose.model("ChatRequest", chatRequestSchema);