import { Router } from 'express';

import {

  reportMessage,

  getAllReports,

  reviewReport,

} from '../controllers/reportController';

import { authenticate, authorize } from '../middleware/auth';

 

const router = Router();

 

router.use(authenticate);

 

router.post('/', reportMessage);

router.get('/', authorize('admin'), getAllReports);

router.put('/:reportId', authorize('admin'), reviewReport);

 

export default router;