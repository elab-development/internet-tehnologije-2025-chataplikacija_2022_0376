// routes/uploadRoutes.ts
import { Router } from 'express';
import { uploadFile, upload } from '../controllers/uploadController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Upload fajla (zahteva autentifikaciju)
router.post('/', authenticate, upload.single('file'), uploadFile);

export default router;