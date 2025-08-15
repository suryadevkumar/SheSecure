
import User from "../models/User.js";
import Profile from "../models/Profile.js";
import Qualification from "../models/Qualification.js";
import { contactUs } from '../mails/contactUs.js';
import mailSender from "../utils/nodemailer.js";
import dotenv from 'dotenv';
dotenv.config();

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

// Controller for handling contact form submissions
export const submitContactForm = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        const date = new Date().toLocaleString();

        // Validate required fields
        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }

        // Generate HTML email using your template function
        const emailHtml = contactUs(name, email, date, subject, message);

        // Send email to your support team
        await mailSender(
            process.env.EMAIL_SUPER_ADMIN, 
            `New Contact-Us Form Submission: ${subject}`,
            emailHtml
        );

        // Optional: Send confirmation email to the user
        await mailSender(
            email,
            'Thank you for contacting SheSecure',
            `<p>Dear ${name},</p>
             <p>Thank you for reaching out to SheSecure. We've received your message and will get back to you soon.</p>
             <p><strong>Your message:</strong><br>${message}</p>
             <p>Best regards,<br>The SheSecure Team</p>`
        );

        res.status(200).json({
            success: true,
            message: 'Your message has been sent successfully!',
        });

    } catch (error) {
        console.error('Error in contact form submission:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while processing your request',
            error:error.message,
        });
    }
};
