import mongoose from "mongoose";

const crimeInteractionSchema = new mongoose.Schema(
  {
    crimeReport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CrimeReport",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    supportStatus: {
      type: String,
      enum: ["Support", "Unsupport", null],
      default: null,
    },
    comments: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment"
    }]
  },
  {
    timestamps: true
  }
);

// Ensure a user can only have one support/unsupport record per crime report
crimeInteractionSchema.index({ crimeReport: 1, user: 1 }, { unique: true });

export default mongoose.model("CrimeInteraction", crimeInteractionSchema);