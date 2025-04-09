import express from 'express';
import { getChatRequests, getChatRooms, getMessages, markMessagesAsRead } from '../controllers/Counselling.js';
const router = express.Router();

router.get('/requests', getChatRequests);
router.get('/rooms', getChatRooms);
router.get('/messages', getMessages);
router.post('/messages/read', markMessagesAsRead);

export default router;