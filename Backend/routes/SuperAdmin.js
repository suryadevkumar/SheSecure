import express from 'express';
import { authenticateUser, isSuperAdmin } from '../utils/authenticateUser.js';
import { 
    approveAdmin, 
    rejectAdmin, 
    getAllAdmin, 
} from "../controllers/SuperAdmin.js";

const router = express.Router();

// Secure routes using API key
router.put("/approve/:userId",authenticateUser ,isSuperAdmin, approveAdmin);
router.delete("/reject/:userId",authenticateUser , isSuperAdmin, rejectAdmin);
router.get("/getall/admin",authenticateUser , isSuperAdmin, getAllAdmin);

export default router;
