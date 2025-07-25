import otpGenerator from 'otp-generator';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { uploadToCloudinary } from '../utils/uploadToCloudinary.js';
import User from "../models/User.js";
import Profile from "../models/Profile.js";
import Qualification from '../models/Qualification.js';
import mailSender from "../utils/nodemailer.js";
import { sendotp } from '../mails/sendotp.js';
import { sendCustomerCareEmail } from '../mails/customerCare.js';

dotenv.config();

// Function to assign admin in a round-robin fashion
const getNextAdmin = async () => {
    const admins = await User.find({ userType: "Admin", approved: "Verified" }).sort('_id'); // Get all admins
    if (admins.length === 0) return null; // No admins available

    // Find the last assigned Counsellor to determine the last admin
    const lastAssignedCouselor = await User.findOne({ userType: "Counsellor" }).sort('-createdAt');

    let lastAdminIndex = admins.some(a => a._id.equals(lastAssignedCouselor?.assignedAdmin))
        ? admins.findIndex(a => a._id.equals(lastAssignedCouselor.assignedAdmin))
        : -1;

    // Select the next admin in a round-robin manner
    const nextAdminIndex = (lastAdminIndex + 1) % admins.length;
    return admins[nextAdminIndex]._id;
};

// Helper function to cleanup all created resources
async function cleanupResources(qualificationIds = [], profile = null, user = null) {
    try {
        // Delete user if created
        if (user) {
            await User.deleteOne({ _id: user._id });
        }

        // Delete profile if created
        if (profile) {
            await Profile.deleteOne({ _id: profile._id });
        }

        // Delete qualifications if any were created
        if (qualificationIds.length > 0) {
            await Qualification.deleteMany({ _id: { $in: qualificationIds } });

            // Optional: Clean up Cloudinary files if needed
            // await deleteFromCloudinary(qualificationIds);
        }
    } catch (cleanupError) {
        console.error("Cleanup failed:", cleanupError);
    }
}

//check user exist or not
export const userExist = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            if (["Admin", "Counsellor"].includes(existingUser.userType)) {
                if (existingUser.approved === "Unverified") {
                    return res.status(403).json({
                        success: false,
                        message: "Your account is awaiting approval from the Super Admin.",
                    });
                }
                else {
                    return res.status(400).json({
                        success: true,
                        message: 'User already exists. Please sign in to continue!',
                    });
                }
            }
            else {
                return res.status(400).json({
                    success: true,
                    message: 'User already exists. Please sign in to continue!',
                });
            }
        }
        return res.status(200).json({
            success: false,
            message: "Account not Found!"
        });

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            success: false,
            message: "User Cannot be Registered, Please Try Again."
        });
    }
};

// send otp for email verification
export const sendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        const otp = otpGenerator.generate(6, { digits: true, alphabets: false, upperCase: false, specialChars: false });

        console.log(otp);   
        
        req.session.emailOTP = otp;
        req.session.otpExpiresAt = Date.now() + 5 * 60 * 1000;

        console.log(req.session.emailOTP);

        // Save session data
        req.session.save((err) => {
            if (err) {
                console.error('Failed to save session:', err);
            }
        });

        try {
            const mailResponse = await mailSender(email, "Your OTP Code", sendotp(otp));
            console.log("Email sent successfully");
        } catch (error) {
            console.error("Error while sending OTP:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to send OTP"
            });
        }

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully"
        });

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const verifyOTP = async (req, res) => {
    try {
        const { emailOTP } = req.body;

        console.log(req.session.emailOTP, req.session.otpExpiresAt);

        // Check if OTP exists and has not expired
        if (!req.session.emailOTP || Date.now() > req.session.otpExpiresAt) {
            req.session.emailOTP = null; // Clear OTP after expiration
            req.session.otpExpiresAt = null;
            return res.status(400).json({
                success: false,
                message: "OTP has expired or not found"
            });
        }

        // Validate OTP
        if (req.session.emailOTP !== emailOTP) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }

        // OTP is valid, clear session data
        req.session.emailOTP = null;
        req.session.otpExpiresAt = null;

        return res.status(200).json({
            success: true,
            message: "OTP verified successfully"
        });

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const signUp = async (req, res) => {
    let createdProfile = null;
    let createdQualifications = [];
    let createdUser = null;

    try {
        // Parse input data - using consistent field names
        const { firstName, lastName, email, mobileNumber, userType, qualifications: qualificationsString } = req.body;

        // Validate input
        if (!firstName || !lastName || !email || !mobileNumber || !userType) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required.',
            });
        }

        // Parse qualifications only for Counsellor/Admin types
        let qualifications = [];
        if (userType === "Counsellor" || userType === "Admin") {
            try {
                qualifications = qualificationsString ? JSON.parse(qualificationsString) : [];
                if (qualifications.length === 0) {
                    return res.status(400).json({
                        success: false,
                        message: "Qualifications are required for Counsellors/Admins"
                    });
                }
            } catch (e) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid qualifications format"
                });
            }

            // Process qualifications
            for (let i = 0; i < qualifications.length; i++) {
                const qual = qualifications[i];

                if (!req.files || !req.files[`qualifications[${i}].certificate`]) {
                    await cleanupResources(createdQualifications, createdProfile, createdUser);
                    return res.status(400).json({
                        success: false,
                        message: `Certificate missing for qualification ${i + 1}`
                    });
                }

                const certificateFile = req.files[`qualifications[${i}].certificate`];
                const uploadedCertificate = await uploadToCloudinary(certificateFile, "qualification_certificates");

                const newQualification = await Qualification.create({
                    courseName: qual.courseName,
                    percentage: qual.percentage || null,
                    certificate: uploadedCertificate.secure_url
                });
                createdQualifications.push(newQualification._id);
            }
        }

        // Create profile
        createdProfile = await Profile.create({
            gender: null,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName[0]}${lastName[0]}`,
            emergencyContacts: [],
            address: null,
            dob: null,
            location: []
        });

        // Assign admin only for Counsellor
        let assignedAdmin = null;
        if (userType === "Counsellor") {
            try {
                assignedAdmin = await getNextAdmin();
            } catch (adminError) {
                await cleanupResources(createdQualifications, createdProfile, createdUser);
                return res.status(500).json({
                    success: false,
                    message: `Admin assignment failed: ${adminError.message}`
                });
            }
        }

        // Set approval status
        let approved = "Unverified";
        if (userType === "User") {
            approved = "Verified";
        }

        // Create user
        createdUser = await User.create({
            firstName,
            lastName,
            email,
            mobileNumber: mobileNumber,
            userType,
            additionalDetails: createdProfile._id,
            qualification: createdQualifications,
            approved,
            assignedAdmin
        });

        // Populate response
        const populatedUser = await User.findById(createdUser._id)
            .populate('qualification')
            .populate('additionalDetails');

        // Send email (non-critical operation)
        if (createdUser.approved === "Unverified") {
            mailSender(email,"Account created & Pending for Verification",
                `A new ${userType} has signed up and is awaiting approval.\n\nName: ${firstName} ${lastName}\nEmail: ${email}\n\nApprove or reject in the admin panel.`
            ).catch(console.error);
        }

        return res.status(200).json({
            success: true,
            user: populatedUser,
            message: createdUser.approved === "Verified"
                ? 'User registered successfully'
                : "Verification In Process",
        });
    } catch (error) {
        // Clean up any created resources
        await cleanupResources(createdQualifications, createdProfile, createdUser);

        console.error("Signup error: ", error);
        return res.status(500).json({
            success: false,
            message: 'User cannot be registered, please try again.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: `Please Fill up All the Required Fields`,
            });
        }

        const user = await User.findOne({ email })
            .populate({
                path: 'additionalDetails',
                select: 'image',
            })
            .select('firstName lastName email userType token additionalDetails approved'); // ✅ only needed fields

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User is not registered with Us. Please sign up to Continue.",
            });
        }

        if (user.approved === "Unverified") {
            return res.status(401).json({
                success: false,
                message: `Your account is not verified yet.`,
            });
        }

        if (user.approved === "Blocked") {
            return res.status(401).json({
                success: false,
                message: `Your account is Blocked.`,
            });
        }

        const payload = {
            email: user.email,
            id: user._id,
            userType: user.userType,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "72h",
        });

        user.token = token;
        await user.save();

        res.cookie("token", token, {
            httpOnly: true,
            expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        }).status(200).json({
            success: true,
            token,
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                userType: user.userType,
                image: user?.additionalDetails?.image || null,
            },
            message: "User Login Success",
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Login Failure, Please Try Again",
        });
    }
};


export const allUser = async (req, res) => {
    const userId = req.user._id;
    const userType = req.user.userType;

    if (userType === 'SuperAdmin') {
        try {
            const allUsers = await User.find()
                .populate("additionalDetails")
                .populate("qualification")
                .sort({ createdAt: -1 });

            return res.status(200).json({
                success: true,
                message: "All Users fetched successfully",
                allUsers,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
    else if (userType === 'Admin') {
        try {
            const allUsers = await User.find({
                $or: [
                    { userType: "User" },
                    { userType: "Counsellor", assignedAdmin: userId }
                ]
            })
                .populate("additionalDetails")
                .populate("qualification")
                .sort({ createdAt: -1 });

            return res.status(200).json({
                success: true,
                message: "All Users fetched successfully",
                allUsers,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
    else {
        return res.status(500).json({
            success: false,
            message: "You can't fetch this type of data.",
        });
    }
}

export const customerCare = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);

        if (user.accountType == 'Admin' || user.accountType === 'SuperAdmin') {
            return res.status(500).json({
                success: false,
                message: "You can't fetch this type of data.",
            });
        }

        const { subject, message } = req.body;
        const date = new Date().toLocaleString();

        // Validate required fields
        if (!subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(user?.email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }

        // Generate HTML email using your template function
        const emailHtml = sendCustomerCareEmail(user?.firstName, user?.lastName, user?.email, user?.mobileNumber, subject, message);

        // Send email to your support team
        await mailSender(
            "kuldeepbhagbole@gmail.com",
            `New Customer Query : ${subject}`,
            emailHtml
        );

        // Optional: Send confirmation email to the user
        await mailSender(
            user?.email,
            'We\'ve received your query - SheSecure',
            `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #6C63FF;">Thank you for contacting SheSecure</h2>
                <p>Dear ${user?.firstName} ${user?.lastName},</p>
                <p>We've received your query and our support team will get back to you soon.</p>
                
                <div style="background: #F8F9FF; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Subject:</strong> ${subject}</p>
                    <p><strong>Your Message:</strong></p>
                    <p>${message}</p>
                </div>
                
                <p>If you need immediate assistance, please call our support team at ${process.env.SUPPORT_PHONE || 'the number listed on our website'}.</p>
                
                <p>Best regards,<br>The SheSecure Team</p>
                
                <div style="margin-top: 30px; font-size: 12px; color: #777;">
                    <p>This is an automated message. Please do not reply directly to this email.</p>
                </div>
            </div>`
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
            error: error.message,
        });
    }
};