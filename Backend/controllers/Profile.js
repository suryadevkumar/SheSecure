
import User from "../models/User.js";
import Profile from "../models/Profile.js";
import EmergencyContacts from '../models/EmergencyContacts.js'
import Location from "../models/Location.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
import dotenv from 'dotenv';
dotenv.config();

export const getUserAllDetails = async (req, res) => {
    try {
        const userId = req.user._id;

        // Find the user and populate profile details
        const user = await User.findById(userId)
            .populate({
                path: "additionalDetails",
                populate: [
                    { path: "emergencyContacts", model: "EmergencyContacts" }
                ]
            })
            .populate("qualification");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        return res.status(200).json({
            success: true,
            message: "User details retrieved successfully.",
            user
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        let imageUrl = null;

        // Check if a new display picture is uploaded
        if (req.files && req.files.displayPicture) {
            const displayPicture = req.files.displayPicture;

            // Upload image to Cloudinary
            const image = await uploadToCloudinary(
                displayPicture,
                process.env.FOLDER_NAME,
                1000,
                1000
            );
            console.log("Uploaded Image:", image);

            imageUrl = image.secure_url;
        }

        const { address, dob, gender } = req.body;

        // Ensure at least one field is being updated
        if (!imageUrl && !address && !dob && !gender) {
            return res.status(200).json({ success: true, message: "No any update found." });
        }

        // Construct the update object dynamically
        const updateData = {};
        if (gender !== undefined) updateData.gender = gender;
        if (address !== undefined) updateData.address = address;
        if (dob !== undefined) updateData.dob = dob;
        if (imageUrl !== null) updateData.image = imageUrl;

        console.log(updateData);

        // Update profile
        const updatedProfile = await Profile.findByIdAndUpdate(
            user.additionalDetails,
            { $set: updateData },
            { new: true, runValidators: true }
        ).populate("emergencyContacts");

        if (!updatedProfile) {
            return res.status(404).json({ success: false, message: "Profile not found." });
        }

        // 🔵 Now, fetch full user info with populated profile
        const updatedUser = await User.findById(userId)
            .populate({
                path: "additionalDetails",
                populate: { path: "emergencyContacts" }
            });

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            user: updatedUser,
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Delete Account
export const deleteAccount = async (req, res) => {
    try {
        const userId = req.user._id;

        // Check if the user exists
        const user = await User.findById(userId).populate("additionalDetails");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const profileId = user.additionalDetails;

        if (profileId) {
            // Find the profile and delete associated locations and emergency contacts
            const profile = await Profile.findById(profileId).populate(["location", "emergencyContacts"]);

            if (profile) {
                // Delete locations
                if (profile.location && profile.location.length > 0) {
                    await Location.deleteMany({ _id: { $in: profile.location } });
                }

                // Delete emergency contacts
                if (profile.emergencyContacts && profile.emergencyContacts.length > 0) {
                    await EmergencyContacts.deleteMany({ _id: { $in: profile.emergencyContacts } });
                }

                profile.emergencyContacts = [];
                profile.location = [];
                await profile.save();
            }
        }
        user.approved = "Blocked";
        await user.save();

        res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};
