import mongoose from "mongoose";

const crimeLikeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  likeStatus: {
    type: String,
    enum: ["Like", "Unlike", null]
  }
});

export default mongoose.model("CrimeLike", crimeLikeSchema);