import express from 'express';
import { startSOS, updateLocation, getLiveLocation } from '../controllers/sosController.js';

const router = express.Router();

router.post('/start-sos', startSOS);
router.post('/update-location', updateLocation);
router.get('/get-live-location', getLiveLocation);

export default router;