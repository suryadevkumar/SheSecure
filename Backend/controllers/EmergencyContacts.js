import User from "../models/User.js";
import Profile from "../models/Profile.js";
import EmergencyContacts from '../models/EmergencyContacts.js'

export const getEmergencyContacts = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        // Ensure user has a profile
        if (!user.additionalDetails) {
            return res.status(400).json({ success: false, message: "User profile not found." });
        }

        // Find the user's profile and populate emergency contacts
        const profile = await Profile.findById(user.additionalDetails)
            .populate("emergencyContacts"); // ✅ Populating emergency contacts

        if (!profile) {
            return res.status(404).json({ success: false, message: "Profile not found." });
        }

        return res.status(200).json({
            success: true,
            message: "Emergency contacts retrieved successfully.",
            contacts: profile.emergencyContacts,
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Add Emergency Contact
export const addEmergencyContact = async (req, res) => {
    try {
        const { name, contactNumber } = req.body;
        const userId = req.user._id;

        if (!name || !contactNumber) {
            return res.status(400).json({ success: false, message: "All fields are required." });
        }
        const user = await User.findById(userId);

        if (!user.additionalDetails) {
            return res.status(400).json({ success: false, message: "User profile not found." });
        }

        // Create new contact
        const newContact = await EmergencyContacts.create({ name, contactNumber });

        // Add emergency contact to the profile
        const updatedProfile = await Profile.findByIdAndUpdate(
            user.additionalDetails,
            { $push: { emergencyContacts: newContact._id } },
            { new: true }
        )
        .populate("emergencyContacts")
        .populate("location");

        return res.status(201).json({
            success: true,
            message: "Emergency contact added successfully.",
            profile: updatedProfile,
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Remove Emergency Contact
export const removeEmergencyContact = async (req, res) => {
    try {
        const { contactId } = req.params;
        const userId = req.user._id;
        const user = await User.findById(userId);

        // Remove contact from profile
        const updatedProfile = await Profile.findByIdAndUpdate(
            user.additionalDetails,
            { $pull: { emergencyContacts: contactId } },
            { new: true }
        )
        .populate("emergencyContacts")
        .populate("location");

        if (!updatedProfile) {
            return res.status(404).json({ success: false, message: "Profile not found." });
        }

        // Delete the emergency contact document
        await EmergencyContacts.findByIdAndDelete(contactId);

        return res.status(200).json({
            success: true,
            message: "Emergency contact removed successfully.",
            profile: updatedProfile,
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Update Emergency Contact
export const updateEmergencyContact = async (req, res) => {
    try {
        const { contactId } = req.params;
        const { name, contactNumber } = req.body;

        // Validate input
        if (!name && !contactNumber) {
            return res.status(400).json({ success: false, message: "At least one field is required for update." });
        }

        // Find contact
        const contact = await EmergencyContacts.findById(contactId);
        if (!contact) {
            return res.status(404).json({ success: false, message: "Emergency contact not found." });
        }

        // Update fields
        if (name) contact.name = name;
        if (contactNumber) contact.contactNumber = contactNumber;

        await contact.save();

        return res.status(200).json({
            success: true,
            message: "Emergency contact updated successfully.",
            contact,
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
