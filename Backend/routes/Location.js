import express from 'express';
import { fetchLocationHistory, saveLocation } from '../controllers/Location.js';
import { authenticateUser } from '../utils/authenticateUser.js';
const router = express.Router();

router.post('/save-userLocation', authenticateUser, saveLocation);
router.get('/location-history', authenticateUser, fetchLocationHistory);

export default router;