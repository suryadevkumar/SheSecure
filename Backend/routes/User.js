

const express=require("express");
const router=express.Router();
const {login,
    signUp, 
    sendOTP,
    verifyOTP,
    sendMobileOTP,
    verifyMobileOTP
} = require("../controllers/Auth");

router.post("/login", login);
router.post("/signup", signUp);
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/send-mobile-otp", sendMobileOTP);
router.post("/verify-mobile-otp", verifyMobileOTP);

module.exports = router;