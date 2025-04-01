import otpGenerator from 'otp-generator';
import jwt from 'jsonwebtoken';
import admin from 'firebase-admin';
import User from "../models/User.js";
import Profile from "../models/Profile.js";
import mailSender from "../utils/nodemailer.js";

import serviceAccount from '../config/she-576ee-firebase-adminsdk-fbsvc-fe4f4d89e5.json' assert { type: 'json' };;
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

//send otp for mobile verification
export const sendMobileOTP = async (req, res) => {
    try {
      const { phoneNumber } = req.body;
  
      if (!phoneNumber) {
        return res.status(400).json({ success: false, message: "Phone number is required" });
      }
  
      // Generate an OTP for phone authentication
      const user = await admin.auth().createUser({ phoneNumber });
  
      // Send OTP
      const customToken = await admin.auth().createCustomToken(user.uid);
  
      res.status(200).json({
        success: true,
        message: "OTP sent successfully",
        token: customToken,
      });
  
    } catch (error) {
      console.error("Error sending OTP:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  };

//verify otp for mobile verification
export const verifyMobileOTP = async (req, res) => {
    try {
        const { phoneNumber, otp } = req.body;

        if (!phoneNumber || !otp) {
            return res.status(400).json({ success: false, message: "Phone number and OTP are required" });
        }

        // Verify OTP using Firebase
        const verifyResult = await admin.auth().verifyIdToken(otp);
        
        if (!verifyResult) {
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        }

        return res.status(200).json({ success: true, message: "OTP verified successfully" });

    } catch (error) {
        console.error("OTP Verification Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const userExist = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: true,
                message: 'User already exists. Please sign in to continue!',
            });
        }
        return res.status(200).json({
            success: false,
            message: "Account not Found!"
        });

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            success: false,
            message: error.message
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

        req.session.emailOTP = otp;
        req.session.otpExpiresAt = Date.now() + 5 * 60 * 1000;

        // Save session data
        req.session.save((err) => {
            if (err) {
                console.error('Failed to save session:', err);
            }
        });

        try {
            const mailResponse = await mailSender(email, otp);
            console.log("Email sent successfully:", mailResponse);
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
  try {
    const { firstName, lastName, email, mobile, userType, dob } = req.body;

    if (!firstName || !lastName || !email || !mobile || !userType || !dob) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required.',
      });
    }

    const profileDetails = await Profile.create({
      gender: null,
      medicalInfo: null,
      image: null,
      emergencyContacts: [],
      address: null,
    });

    const user = await User.create({
      firstName,
      lastName,
      email,
      mobile,
      userType,
      additionalDetails: profileDetails._id,
      dob,
      locationHistory: [],
    });

    return res.status(200).json({
      success: true,
      user,
      message: 'User registered successfully',
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'User cannot be registered, please try again.',
    });
  }
};

export const login = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if user exists
        const user = await User.findOne({ email }).populate('additionalDetails');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not registered. Please sign up.",
            });
        }

        // Generate JWT
        const payload = {
            email: user.email,
            id: user._id,
            accountType: user.accountType,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "72h",
        });

        // Store user info in session
        req.session.user = {
            id: user._id,
            email: user.email,
            accountType: user.accountType,
        };

        // Save session
        req.session.save(err => {
            if (err) {
                console.error("Session save error:", err);
            }
        });

        res.cookie("token", token, { httpOnly: true }).status(200).json({
            success: true,
            token,
            user,
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