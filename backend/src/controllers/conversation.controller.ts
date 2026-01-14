import { Response } from 'express';
import { ConversationService } from '../services/conversation.service';
import { AuthRequest } from '../middleware/auth.middleware';

export class ConversationController {
  private conversationService = new ConversationService();

  getConversations = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const conversations = await this.conversationService.getUserConversations(
        req.userId
      );

      res.status(200).json({ conversations });
    } catch (error) {
      console.error('Get conversations error:', error);
      res.status(500).json({ error: 'Failed to fetch conversations' });
    }
  };

  getConversation = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { id } = req.params;
      const conversation = await this.conversationService.getConversationById(
        id,
        req.userId
      );

      res.status(200).json({ conversation });
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to fetch conversation' });
      }
    }
  };

  createConversation = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { type, participantIds, name, description } = req.body;

      if (!type || !participantIds || !Array.isArray(participantIds)) {
        res.status(400).json({
          error: 'Type and participantIds are required',
        });
        return;
      }

      let conversation;

      if (type === 'private') {
        if (participantIds.length !== 1) {
          res.status(400).json({
            error: 'Private conversation requires exactly one other participant',
          });
          return;
        }
        conversation = await this.conversationService.createPrivateConversation(
          req.userId,
          participantIds[0]
        );
      } else if (type === 'group') {
        if (!name) {
          res.status(400).json({ error: 'Group name is required' });
          return;
        }
        conversation = await this.conversationService.createGroupConversation({
          name,
          description,
          createdBy: req.userId,
          participantIds,
        });
      } else {
        res.status(400).json({ error: 'Invalid conversation type' });
        return;
      }

      res.status(201).json({
        message: 'Conversation created successfully',
        conversation,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to create conversation' });
      }
    }
  };

  addParticipants = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { id } = req.params;
      const { participantIds } = req.body;

      if (!participantIds || !Array.isArray(participantIds)) {
        res.status(400).json({ error: 'participantIds array is required' });
        return;
      }

      await this.conversationService.addParticipants(id, participantIds, req.userId);

      res.status(200).json({ message: 'Participants added successfully' });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to add participants' });
      }
    }
  };

  removeParticipant = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { id, userId } = req.params;

      await this.conversationService.removeParticipant(id, userId, req.userId);

      res.status(200).json({ message: 'Participant removed successfully' });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to remove participant' });
      }
    }
  };

  deleteConversation = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { id } = req.params;
      await this.conversationService.deleteConversation(id, req.userId);

      res.status(200).json({ message: 'Conversation deleted successfully' });
    } catch (error) {
      if (error instanceof Error) {
        res.status(403).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to delete conversation' });
      }
    }
  };
}