import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    firstName: {
      required: true,
      type: String,
      trim: true,
    },
    lastName: {
      required: true,
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    mobile: {
      type: Number,
      required: true,
    },
    userType: {
      type: String,
      enum: ["user", "counsellor", "admin"],
      required: true,
    },
    additionalDetails: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Profile",
    },
    dob: {
      type: Date,
      required: true,
    },
    locationHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LocationHistory",
      },
    ],
  }
);

export default mongoose.model("User", userSchema);