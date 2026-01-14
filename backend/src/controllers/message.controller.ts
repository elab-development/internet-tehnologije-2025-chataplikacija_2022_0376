import { Response } from 'express';
import { MessageService } from '../services/message.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { io } from '../server';

export class MessageController {
  private messageService = new MessageService();

  getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { id: conversationId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      const result = await this.messageService.getMessagesByConversation(
        conversationId,
        req.userId,
        page,
        limit
      );

      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        res.status(403).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to fetch messages' });
      }
    }
  };

  sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { conversationId, content, type, fileUrl, fileName, fileSize } = req.body;

      if (!conversationId || !content) {
        res.status(400).json({
          error: 'conversationId and content are required',
        });
        return;
      }

      const message = await this.messageService.sendMessage({
        conversationId,
        senderId: req.userId,
        content,
        type,
        fileUrl,
        fileName,
        fileSize,
      });

      // Emit socket event
      io.to(`conversation:${conversationId}`).emit('message:new', message);

      res.status(201).json({ message });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to send message' });
      }
    }
  };

  editMessage = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { id: messageId } = req.params;
      const { content } = req.body;

      if (!content || !content.trim()) {
        res.status(400).json({ error: 'Content is required' });
        return;
      }

      const message = await this.messageService.editMessage(
        messageId,
        req.userId,
        content
      );

      // Emit socket event
      io.to(`conversation:${message.conversationId}`).emit('message:edit', message);

      res.status(200).json({ message });
    } catch (error) {
      if (error instanceof Error) {
        res.status(403).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to edit message' });
      }
    }
  };

  deleteMessage = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { id: messageId } = req.params;
      await this.messageService.deleteMessage(messageId, req.userId);

      // Emit socket event
      io.emit('message:delete', messageId);

      res.status(200).json({ message: 'Message deleted successfully' });
    } catch (error) {
      if (error instanceof Error) {
        res.status(403).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to delete message' });
      }
    }
  };

  searchMessages = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { id: conversationId } = req.params;
      const { query } = req.query;

      if (!query || typeof query !== 'string') {
        res.status(400).json({ error: 'Search query is required' });
        return;
      }

      const messages = await this.messageService.searchMessages(
        conversationId,
        req.userId,
        query
      );

      res.status(200).json({ messages });
    } catch (error) {
      if (error instanceof Error) {
        res.status(403).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to search messages' });
      }
    }
  };
}