import mongoose from "mongoose";

const crimeInteractionSchema = new mongoose.Schema(
    {
        crimeReport: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CrimeReport",
            required: true,
        },
        like:[{
            type: mongoose.Schema.Types.ObjectId,
            ref: "CrimeLike",
        }],
        comments: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
        }]
    },
    {
        timestamps: true
    }
);

export default mongoose.model("CrimeInteraction", crimeInteractionSchema);