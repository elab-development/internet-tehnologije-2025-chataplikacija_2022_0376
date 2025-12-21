import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AppDataSource } from '../config/database';
import { Message, MessageType } from '../entities/Message';
import { ChatMembership } from '../entities/ChatMembership';

export const sendMessage = async (req: AuthRequest, res: Response) => {
    try {
        const { chatId, content, type = MessageType.TEXT, fileUrl, fileName } = req.body;
        const senderId = req.user!.id;
        const messageRepository = AppDataSource.getRepository(Message);
        const membershipRepository = AppDataSource.getRepository(ChatMembership);

        // Verify user is member of chat
        const membership = await membershipRepository.findOne({
            where: { chatId, userId: senderId },
        });

        if (!membership) {
            return res.status(403).json({ message: 'Not a member of this chat' });
        }

        // Create message
        const message = messageRepository.create({
            chatId,
            senderId,
            content,
            type,
            fileUrl,
            fileName,
        });
        await messageRepository.save(message);

        const savedMessage = await messageRepository.findOne({
            where: { id: message.id },
            relations: ['sender'],
        });

        return res.status(201).json(savedMessage);
    } catch (error) {
        console.error('Send message error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

export const getChatMessages = async (req: AuthRequest, res: Response) => {
    try {
        const { chatId } = req.params;
        const userId = req.user!.id;

        const membershipRepository = AppDataSource.getRepository(ChatMembership);
        const messageRepository = AppDataSource.getRepository(Message);

        const membership = await membershipRepository.findOne({
            where: { chatId, userId },
        });

        if (!membership) {
            return res.status(403).json({ message: 'Not a member of this chat' });
        }

        const messages = await messageRepository.find({
            where: { chatId, isDeleted: false },
            relations: ['sender'],
            order: { createdAt: 'ASC' },
        });

        return res.json(messages);
    } catch (error) {
        console.error('Get messages error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

export const editMessage = async (req: AuthRequest, res: Response) => {
    try {
        const { messageId } = req.params;
        const { content } = req.body;
        const userId = req.user!.id;

        const messageRepository = AppDataSource.getRepository(Message);

        const message = await messageRepository.findOne({
            where: { id: messageId },
        });

        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        if (message.senderId !== userId) {
            return res.status(403).json({ message: 'Not authorized to edit this message' });
        }

        message.content = content;
        message.isEdited = true;
        await messageRepository.save(message);

        return res.json(message);
    } catch (error) {
        console.error('Edit message error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

export const deleteMessage = async (req: AuthRequest, res: Response) => {
    try {
        const { messageId } = req.params;
        const userId = req.user!.id;

        const messageRepository = AppDataSource.getRepository(Message);

        const message = await messageRepository.findOne({
            where: { id: messageId },
        });

        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        if (message.senderId !== userId) {
            return res.status(403).json({ message: 'Not authorized to delete this message' });
        }

        message.isDeleted = true;
        message.content = 'This message has been deleted';
        await messageRepository.save(message);

        return res.json({ message: 'Message deleted successfully' });
    } catch (error) {
        console.error('Delete message error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

export const searchMessages = async (req: AuthRequest, res: Response) => {
    try {
        const { chatId, query } = req.query;
        const userId = req.user!.id;

        const membershipRepository = AppDataSource.getRepository(ChatMembership);
        const messageRepository = AppDataSource.getRepository(Message);

        // Provera da li je korisnik u chatu
        const membership = await membershipRepository.findOne({
            where: { chatId: chatId as string, userId },
        });

        if (!membership) {
            return res.status(403).json({ message: 'Not a member of this chat' });
        }

        // Glavni kveri za pretragu
        const messages = await messageRepository
            .createQueryBuilder('message')
            .leftJoinAndSelect('message.sender', 'sender')
            .where('message.chatId = :chatId', { chatId })
            .andWhere('message.isDeleted = :isDeleted', { isDeleted: false })
            .andWhere('message.content ILIKE :query', { query: `%${query}%` })
            .orderBy('message.createdAt', 'DESC')
            .getMany();

        return res.json(messages);
    } catch (error) {
        console.error('Search messages error:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};