import { Router } from 'express';
import {
  createPrivateChat,
  createGroupChat,
  getUserChats,
  getChatById, 
  removeMemberFromGroup,
} from '../controllers/chatController';
import { getChatMessages } from '../controllers/messageController'; // ← DODAJ
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getUserChats);
router.get('/:id', getChatById);
router.get('/:id/messages', getChatMessages); // ← DODAJ OVO
router.post('/private', createPrivateChat);
router.post('/group', createGroupChat);
router.delete('/group/member', authorize('moderator', 'admin'), removeMemberFromGroup);

export default router;