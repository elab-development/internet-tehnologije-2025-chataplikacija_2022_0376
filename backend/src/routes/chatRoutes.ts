import { Router } from 'express';
import {
  createPrivateChat,
  createGroupChat,
  getUserChats,
  getChatById, 
  removeMemberFromGroup,
  addMemberToGroup
} from '../controllers/chatController';
import { getChatMessages } from '../controllers/messageController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getUserChats);
router.get('/:id', getChatById);
router.get('/:id/messages', getChatMessages); 
router.post('/private', createPrivateChat);
router.post('/group', createGroupChat);
router.delete('/group/member', authorize('moderator', 'admin'), removeMemberFromGroup);
router.post('/group/add-member', addMemberToGroup);
router.post('/group/remove-member', removeMemberFromGroup);

export default router;