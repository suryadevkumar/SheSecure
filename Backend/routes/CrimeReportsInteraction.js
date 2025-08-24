import express from 'express';
import {
  getCrimeInteractions,
  interactWithCrime,
  commentOnCrime
} from '../controllers/CrimeRepotsInteraction.js';
import { authenticateUser, isUser } from '../utils/authenticateUser.js';

const router = express.Router();

router.get('/crime-interaction/:crimeId', authenticateUser, isUser, getCrimeInteractions);
router.post('/:crimeId/interact', authenticateUser, isUser, interactWithCrime);
router.post('/:crimeId/comment', authenticateUser, isUser, commentOnCrime);

export default router;