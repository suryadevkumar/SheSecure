import mongoose from "mongoose";

const crimeReportSchema = new mongoose.Schema(
    {
        typeOfCrime: {
            type: String,
            enum: [
                "Assault", "Homicide", "Kidnapping", "Domestic Violence", "Robbery",
                "Burglary", "Theft", "Vandalism", "Arson",
                "Hacking", "Online Fraud", "Cyberbullying", "Identity Theft",
                "Fraud", "Money Laundering", "Bribery", "Counterfeiting",
                "Drug Trafficking", "Illegal Possession of Drugs", "Public Intoxication",
                "Sexual Harassment", "Rape", "Human Trafficking", "Child Exploitation",
                "Harassment", "Stalking", "Trespassing", "Extortion", "Other",
            ],
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        location: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Location",
            required: true,
        },
        status: {
            type: String,
            enum: ['In Progress', 'Verified'],
            default: 'In Progress'
        },
        crimePhotos: [{
            type: String,
        }],
        crimeVideos: [{
            type: String,
        }],
        FIR: {
            type: String,
            required: true,
        },
        reportedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        assignedAdmin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        suspects: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Suspect"
        }],
        witnesses: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Witness"
        }],
        likeCount: {
            type: Number,
            default: 0
        },
        unlikeCount: {
            type: Number,
            default: 0
        }
    },
    { timestamps: true }
);

export default mongoose.model('CrimeReport', crimeReportSchema);