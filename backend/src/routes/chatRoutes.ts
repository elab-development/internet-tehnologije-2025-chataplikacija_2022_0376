
import { Router } from 'express';

import {

  createPrivateChat,

  createGroupChat,

  getUserChats,

  removeMemberFromGroup,

} from '../controllers/chatController';

import { authenticate, authorize } from '../middleware/auth';

 

const router = Router();

 

router.use(authenticate);

 

router.post('/private', createPrivateChat);

router.post('/group', createGroupChat);

router.get('/', getUserChats);

router.delete('/group/member', authorize('moderator', 'admin'), removeMemberFromGroup);

 

export default router;