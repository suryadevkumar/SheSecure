import express from 'express';
import { 
  startSOS, 
  endSOS, 
  fetchSosLocation, 
  checkActiveSOSForUser,
  keepAlive
} from '../controllers/sosController.js';
import { authenticateUser } from '../utils/authenticateUser.js';

const router = express.Router();

router.post('/start-sos', authenticateUser, startSOS);
router.post('/end-sos', authenticateUser, endSOS);
router.post('/sos-liveLocation', fetchSosLocation);
router.post('/check-active', authenticateUser, checkActiveSOSForUser);
router.post('/keep-alive', keepAlive);

export default router;