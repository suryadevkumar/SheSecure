import express from 'express';
import { authenticateUser, isUser } from '../utils/authenticateUser.js';

const router = express.Router();
import {
    addEmergencyContact,
    removeEmergencyContact,
    updateEmergencyContact,
    getEmergencyContacts,
} from "../controllers/EmergencyContacts.js";

router.get("/get", authenticateUser, isUser, getEmergencyContacts);
router.post("/add", authenticateUser, isUser, addEmergencyContact);
router.put("/update/:contactId", authenticateUser, isUser, updateEmergencyContact);
router.delete("/remove/:contactId", authenticateUser, isUser, removeEmergencyContact);

export default router;
