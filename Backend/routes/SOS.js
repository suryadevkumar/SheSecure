import express from 'express';
import { 
  startSOS, 
  endSOS, 
  fetchSosLocation, 
  checkActiveSOSForUser,
  keepAlive,
  sendLink
} from '../controllers/sosController.js';
import { authenticateUser, isUser } from '../utils/authenticateUser.js';

const router = express.Router();

router.post('/start-sos', authenticateUser, isUser, startSOS);
router.post('/send-link', authenticateUser, isUser, sendLink);
router.post('/end-sos', authenticateUser, isUser, endSOS);
router.post('/check-active', authenticateUser, isUser, checkActiveSOSForUser);
router.post('/sos-liveLocation', fetchSosLocation);
router.post('/keep-alive', keepAlive);

export default router;