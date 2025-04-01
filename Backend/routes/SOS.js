import express from 'express';
import { startSOS, endSOS, fetchSosLocation } from '../controllers/sosController.js';
import authenticateUser from '../utils/authenticateUser.js';

const router = express.Router();

router.post('/start-sos', authenticateUser, startSOS);
router.post('/end-sos', endSOS);
router.post('/sos-liveLocation', fetchSosLocation);

export default router;