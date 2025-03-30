import express from 'express';
import { startSOS, endSOS, checkSOSStatus, fetchLiveLocation, fetchHistoryLocation } from '../controllers/sosController.js';
import authenticateUser from '../utils/authenticateUser.js';

const router = express.Router();

router.post('/start-sos', authenticateUser, startSOS);
router.post('/end-sos', endSOS);
router.post('/sos-status', checkSOSStatus);
router.post('/live-location', fetchLiveLocation);
router.post('/history-location', fetchHistoryLocation);

export default router;