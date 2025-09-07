import mongoose from "mongoose";

const chatRoomSchema = new mongoose.Schema({
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
    counsellor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    endRequestStatus: {
      type: Boolean,
      default: false
    },
    endedAt: {
      type: Date,
      default: null
    }
  }, { timestamps: true });

export default mongoose.model("ChatRoom", chatRoomSchema);