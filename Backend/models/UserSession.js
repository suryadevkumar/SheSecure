import mongoose from "mongoose";
const userSessionSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    socketId: {
        type: String,
        required: true
    },
    lastActive: {
        type: Date,
        default: Date.now
    },
    online: {
        type: Boolean,
        default: true
    }
});

export default mongoose.model("UserSession", userSessionSchema);