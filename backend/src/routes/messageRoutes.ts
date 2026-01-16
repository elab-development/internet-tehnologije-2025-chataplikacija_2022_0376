import { Router } from 'express';
import {
  sendMessage,
  editMessage,
  deleteMessage,
  searchMessages,
} from '../controllers/messageController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', sendMessage);                    // POST /api/messages
router.put('/:messageId', editMessage);           // PUT /api/messages/:messageId
router.delete('/:messageId', deleteMessage);      // DELETE /api/messages/:messageId
router.get('/search', searchMessages);            // GET /api/messages/search

export default router;