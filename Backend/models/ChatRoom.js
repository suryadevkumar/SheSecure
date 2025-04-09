import mongoose from "mongoose";

const chatRoomSchema = new mongoose.Schema({
    chatRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChatRequest',
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    counsellor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isEnded: {
      type: Boolean,
      default: false
    },
    endedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    endedAt: {
      type: Date,
      default: null
    }
  }, { timestamps: true });

export default mongoose.model("ChatRoom", chatRoomSchema);