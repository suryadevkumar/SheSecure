import express from 'express';
import { reportCrime, verifyCrimeReport, getAllReportsForAdmin, getAllReportsByUser, removeReport, getCrimesNearLocation } from '../controllers/CrimeReport.js';
import { authenticateUser, isUser, isAdmin } from '../utils/authenticateUser.js';
const router = express.Router();


// User
router.post('/report-crime', authenticateUser, isUser, reportCrime);
router.get("/my-reports", authenticateUser, isUser, getAllReportsByUser);
router.post('/get-crimes-near-me', authenticateUser, isUser, getCrimesNearLocation);

// Admin
router.get("/getAllReports", authenticateUser, isAdmin, getAllReportsForAdmin);
router.put("/verify-report/:reportId", authenticateUser, isAdmin, verifyCrimeReport);
router.delete("/remove-report/:reportId", authenticateUser, isAdmin, removeReport);

export default router;
