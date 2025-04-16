import express from 'express';
import { authenticateUser, isAdmin } from '../utils/authenticateUser.js';

import { 
    approveCounsellor, 
    rejectCounsellor, 
    getAllCounsellor,
} from "../controllers/Admin.js";

const router = express.Router();

// Secure routes using API key
router.put("/approve/:userId",authenticateUser ,isAdmin, approveCounsellor);
router.delete("/reject/:userId",authenticateUser , isAdmin, rejectCounsellor);
router.get("/getall/couselor",authenticateUser , isAdmin, getAllCounsellor);

export default router;
