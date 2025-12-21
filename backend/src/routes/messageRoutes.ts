import { Router } from 'express';

import {

  sendMessage,

  getChatMessages,

  editMessage,

  deleteMessage,

  searchMessages,

} from '../controllers/messageController';

import { authenticate } from '../middleware/auth';

import { validateMessage, handleValidationErrors } from '../utils/validation';

 

const router = Router();

 

router.use(authenticate);

 

router.post('/', validateMessage, handleValidationErrors, sendMessage);

router.get('/chat/:chatId', getChatMessages);

router.put('/:messageId', editMessage);

router.delete('/:messageId', deleteMessage);

router.get('/search', searchMessages);

 

export default router;
