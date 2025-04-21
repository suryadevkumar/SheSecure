
import express from 'express';
import { authenticateUser, isUser } from '../utils/authenticateUser.js';
import { 
    submitFeedback, 
    getAllFeedbacks, 
    getAverageRating,
    getUserFeedback
} from "../controllers/Feedback.js";
const router = express.Router();

// Submit feedback (protected route)
router.post('/submit-feedback', authenticateUser, isUser, submitFeedback);
router.get('/get-feedback', getAllFeedbacks);
router.get('/user', authenticateUser, isUser, getUserFeedback);
router.get('/average', getAverageRating);


export default router;