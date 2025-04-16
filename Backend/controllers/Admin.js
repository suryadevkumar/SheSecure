
import User from "../models/User.js";
import Profile from "../models/Profile.js";
import Qualification from "../models/Qualification.js";

// Approve a Counsellor
export const approveCounsellor = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Counsellor not found",
            });
        }

        if (user.approved==="Verified") {
            return res.status(400).json({
                success: false,
                message: "Counsellor is already Verified",
            });
        }

        user.approved = "Verified";
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Counsellor Verified successfully",
            user,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Reject and Delete a Counsellor Request
export const rejectCounsellor = async (req, res) => {
    try {
        const { userId } = req.params;

        // First find the user to check if they exist and get related IDs
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Counsellor not found",
            });
        }

        // Get references to related documents
        const profileId = user.additionalDetails;
        const qualificationIds = user.qualification || [];

        // Delete all related documents in parallel
        await Promise.all([
            User.findByIdAndDelete(userId),
            Profile.findByIdAndDelete(profileId),
            Qualification.deleteMany({ _id: { $in: qualificationIds } })
        ]);

        return res.status(200).json({
            success: true,
            message: "Counsellor rejected and removed successfully",
            user
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get all  Counsellor (Newest First)
export const getAllCounsellor = async (req, res) => {
    try {
        const adminId = req.user._id;

        const counsellors = await User.find({ userType: "Counsellor",assignedAdmin: adminId,})
            .populate("additionalDetails")
            .populate("qualification")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "All Counsellor fetched successfully",
            counsellors,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
