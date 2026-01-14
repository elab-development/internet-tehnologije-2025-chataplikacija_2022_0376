import { Router } from 'express';
import { ConversationController } from '../controllers/conversation.controller';
import { MessageController } from '../controllers/message.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
const conversationController = new ConversationController();
const messageController = new MessageController();

// All routes require authentication
router.use(authenticateToken);

router.get('/', conversationController.getConversations);
router.get('/:id', conversationController.getConversation);
router.post('/', conversationController.createConversation);
router.post('/:id/participants', conversationController.addParticipants);
router.delete('/:id/participants/:userId', conversationController.removeParticipant);
router.delete('/:id', conversationController.deleteConversation);

// Message routes within conversation
router.get('/:id/messages', messageController.getMessages);
router.get('/:id/search', messageController.searchMessages);

export default router;