import express from 'express';
import { authenticateUser } from '../utils/authenticateUser.js';

const router = express.Router();
import {
    getUserAllDetails,
    updateProfile,
    deleteAccount
} from "../controllers/Profile.js";

router.get("/get-details", authenticateUser, getUserAllDetails);
router.put("/update-profile", authenticateUser, updateProfile);
router.delete("/delete-account", authenticateUser, deleteAccount);

export default router;
