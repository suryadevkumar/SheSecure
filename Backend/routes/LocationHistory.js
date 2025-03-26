import express from 'express';
import { saveLocationHistory } from '../controllers/LocationHistory.js';
import authenticateUser from '../utils/authenticateUser.js';
const router = express.Router();

router.post('/save-userLocation', authenticateUser, saveLocationHistory);

export default router;