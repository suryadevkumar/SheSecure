import express from 'express';
import { login, signUp, userExist, sendOTP, verifyOTP, sendMobileOTP, verifyMobileOTP } from '../controllers/Auth.js';

const router = express.Router();

router.post("/login", login);
router.post("/signup", signUp);
router.post("/userExist", userExist);
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/send-mobile-otp", sendMobileOTP);
router.post("/verify-mobile-otp", verifyMobileOTP);

export default router;