
import User from "../models/User.js";
import Profile from "../models/Profile.js";
import Qualification from "../models/Qualification.js";

// Approve a User (Admin/Counselor)
export const approveAdmin = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (user.approved==="Verified") {
            return res.status(400).json({
                success: false,
                message: "User is already approved",
            });
        }

        user.approved = "Verified";
        await user.save();

        return res.status(200).json({
            success: true,
            message: "User approved successfully",
            user,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Reject and Delete a User Request
export const rejectAdmin = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Admin not found",
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
            message: "Admin rejected and removed successfully",
            user,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get  Admin (Newest First)
export const getAllAdmin = async (req, res) => {
    try {
        const admins = await User.find({ userType: "Admin"})
        .populate("additionalDetails")
        .populate("qualification")
        .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "All Admin fetched successfully",
            admins,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
