import express from 'express';
import { reportCrime, verifyCrimeReport, getAllReportsForAdmin, getAllReportsByUser, removeReport } from '../controllers/CrimeReport.js';
import { authenticateUser, isUser, isAdmin } from '../utils/authenticateUser.js';
const router = express.Router();


// User
router.post('/report-crime', authenticateUser, isUser, reportCrime);
router.get("/my-reports", authenticateUser, isUser, getAllReportsByUser);

// Admin
router.get("/getAllReports", authenticateUser, isAdmin, getAllReportsForAdmin);
router.put("/verify/:reportId", authenticateUser, isAdmin, verifyCrimeReport);
router.delete("/removeReport/:reportId", authenticateUser, isAdmin, removeReport);


export default router;
