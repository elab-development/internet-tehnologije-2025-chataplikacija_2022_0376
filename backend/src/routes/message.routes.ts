import { Router } from 'express';
import { MessageController } from '../controllers/message.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
const messageController = new MessageController();

// All routes require authentication
router.use(authenticateToken);

router.post('/', messageController.sendMessage);
router.put('/:id', messageController.editMessage);
router.delete('/:id', messageController.deleteMessage);

export default router;