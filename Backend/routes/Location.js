import express from 'express';
import { saveLocation } from '../controllers/Location.js';
import { authenticateUser } from '../utils/authenticateUser.js';
const router = express.Router();

router.post('/save-userLocation', authenticateUser, saveLocation);

export default router;