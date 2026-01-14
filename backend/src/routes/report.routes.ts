import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/role.middleware';

const router = Router();
const reportController = new ReportController();

// All routes require authentication
router.use(authenticateToken);

// User can create reports
router.post('/', reportController.createReport);

// Admin routes
router.get('/', requireAdmin, reportController.getAllReports);
router.get('/:id', requireAdmin, reportController.getReport);
router.put('/:id', requireAdmin, reportController.reviewReport);
router.post('/users/:userId/suspend', requireAdmin, reportController.suspendUser);
router.post('/users/:userId/unsuspend', requireAdmin, reportController.unsuspendUser);

export default router;