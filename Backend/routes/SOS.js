import express from 'express';
import { 
  startSOS, 
  endSOS, 
  fetchSosLocation, 
  checkActiveSOSForUser,
  keepAlive,
  sendWhatsAppLink
} from '../controllers/sosController.js';
import { authenticateUser, isUser } from '../utils/authenticateUser.js';

const router = express.Router();

router.post('/start-sos', authenticateUser, isUser, startSOS);
router.post('/end-sos', authenticateUser, isUser, endSOS);
router.post('/sos-liveLocation', fetchSosLocation);
router.post('/check-active', authenticateUser, isUser, checkActiveSOSForUser);
router.post('/keep-alive', keepAlive);
router.post('/send-sos-link', authenticateUser, isUser, sendWhatsAppLink);

export default router;