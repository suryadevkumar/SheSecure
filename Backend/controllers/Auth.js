const User = require("../models/User");
const otpGenerator = require("otp-generator");
const Profile = require('../models/Profile');
const mailSender = require('../utils/nodemailer');
const jwt = require("jsonwebtoken");
require("dotenv").config;

const admin = require("firebase-admin");
const serviceAccount = require("../config/she-576ee-firebase-adminsdk-fbsvc-fe4f4d89e5.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

//send otp for mobile verification
exports.sendMobileOTP = async (req, res) => {
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
exports.verifyMobileOTP = async (req, res) => {
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

// send otp for email verification
exports.sendOTP = async(req,res)=>{
    try{
        //fetch email from request body
        const { email } = req.body;

    if (!email) {
        return res.status(400).json({ 
            success: false,
            message: "Email is required" 
        });
    }

        const otp = otpGenerator.generate(6, { digits: true, alphabets: false, upperCase: false, specialChars: false });

        // Store OTP in session with expiration time
        req.session.otp = otp;
        req.session.otpExpiresAt = Date.now() + 5 * 60 * 1000; // Set expiry to 5 minutes
        console.log('OTP Generated : ', otp);
        
        try{
            const mailResponse=await mailSender(email,otp);
            console.log("sent email's response==>", mailResponse);
        }catch(error){
            console.log("error occured while sending mail", error);
        }

        //return response successfully
        return res.status(200).json({
            success: true,
            message: "otp sent successfully",
        })

    }catch(error){
        console.log(error.message);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

exports.verifyOTP= async (req,res)=>{
    try{
        const { otp } = req.body;

    if (!otp) {
        return res.status(400).json({ success:false,message: "OTP is required" });
    }

    // Check if OTP exists and is not expired
    if (Date.now() > req.session.otpExpiresAt) {
        req.session.otp = null;
        req.session.otpExpiresAt = null; 
        return res.status(400).json({ success:false,message: "OTP has expired or not found" });
    }

    // Validate OTP
    if (req.session.otp !== otp) {
        return res.status(400).json({
            success: false,
            message: "Invalid OTP" 
        });
    }

    // OTP is valid, clear session
    req.session.otp = null;
    req.session.otpExpiresAt = null;

    res.status(200).json({ 
        success: true,
        message: "OTP verified successfully" 
    });
    }catch(error){
        console.log(error.message);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

exports.signUp=async (req,res)=>{
    try{
        const {
            firstName,
            lastName,
            email,
            mobileNumber,
            accountType,
            dob
        } = req.body;
    
         //validata data
         if(
            !firstName || 
            !lastName || 
            !email || 
            !mobileNumber || 
            !accountType || 
            !dob
        ) {
            return res.status(403).json({
                success: false,
                message: 'All Fields are required',
            });
        }
    
        //check if user already exist or not 
        const existingUser = await User.findOne({ email });
        if(existingUser) {
            return res.status(400).json({
                success: false,
                message : 'User already exists. Please Sign in to continue.',
            });
        }
    
            //create the additional profile for user
            const profileDetails = await  Profile.create({
                gender : null,
                medicalInfo: null,
                image: null,
                emergencyContacts: [],
                address: null
            });
        
            const user = await User.create({
                firstName,
                lastName,
                email,
                mobileNumber,
                accountType,
                additionalDetails: profileDetails._id,
                dob
            });
    
            //return response
            return res.status(200).json({
                success: true,
                user,
                message: 'User Registered Successfully',
            })
    }catch(error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'User Cannot be Registered, Please Try Again.'
        })
    }
}

exports.login=async (req,res)=>{
    try {
        //get data from req body
        const {email} = req.body;
        //validation of data
        if(!email) {
            return res.status(400).json({
                success: false,
                message: `Please Fill up All the Required Fields`,
            });
        }
        //check user exists or not
        const user = await User.findOne({email}).populate('additionalDetails');
        if(!user) {
            return res.status(401).json({
                //Return 401 unauthorized status code with error message
                success: false,
                message: `User is not registered with Us, Please signup to Continue`,
            });
        }
        //Generate JWT
        const payload = {
            email: user.email,
            id: user._id,
            accountType: user.accountType,
        }

        const token = jwt.sign(payload, process.env.JWT_SECRET,{
            expiresIn:"72h",
        });

        //create cookie and send response
        const options = {
            expiresIn: new Date(Date.now()+ 3*24*60*60*1000),
            httpOnly: true,
        }
        res.cookie("token", token , options).status(200).json({
            success: true,
            token,
            user,
            message: `User Login Success`,
        });
        
    } catch (error) {
        console.log(error);
        //Return 500 Internal Server Error status code with error message
        return res.status(500).json({
            success: false,
            message: `Login Failure Please Try Again`,
        });
    }
}