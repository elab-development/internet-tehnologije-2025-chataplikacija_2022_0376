import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AppDataSource } from '../config/database';
import { Message, MessageType } from '../entities/Message';
import { ChatMembership } from '../entities/ChatMembership';

/**
 * Pošalji novu poruku u chat
 * POST /api/messages
 */
export const sendMessage = async (req: AuthRequest, res: Response) => {
    try {
        // Prihvatamo i chatId i conversationId (frontend šalje conversationId)
        const { 
            chatId: chatIdFromBody, 
            conversationId, 
            content, 
            type = MessageType.TEXT, 
            fileUrl, 
            fileName 
        } = req.body;
        
        // Koristi šta god da je poslato
        const chatId = chatIdFromBody || conversationId;
        const senderId = req.user!.id;

        console.log('📩 [SEND MESSAGE] Request:', { 
            chatId, 
            senderId, 
            content: content?.substring(0, 50), 
            type,
            hasFile: !!fileUrl 
        });

        // Validacija
        if (!chatId) {
            console.log('❌ [SEND MESSAGE] Missing chatId');
            return res.status(400).json({ message: 'chatId or conversationId is required' });
        }

        if (!content || !content.trim()) {
            console.log('❌ [SEND MESSAGE] Missing content');
            return res.status(400).json({ message: 'Message content is required' });
        }

        const messageRepository = AppDataSource.getRepository(Message);
        const membershipRepository = AppDataSource.getRepository(ChatMembership);

        // Proveri da li je korisnik član chata
        const membership = await membershipRepository.findOne({
            where: { chatId, userId: senderId },
        });

        if (!membership) {
            console.log('❌ [SEND MESSAGE] User not member of chat');
            return res.status(403).json({ message: 'Not a member of this chat' });
        }

        // Kreiraj poruku
        const message = messageRepository.create({
            chatId,
            senderId,
            content: content.trim(),
            type,
            fileUrl,
            fileName,
        });

        await messageRepository.save(message);
        console.log('✅ [SEND MESSAGE] Message created:', message.id);

        // Učitaj poruku sa sender relacijom
        const savedMessage = await messageRepository.findOne({
            where: { id: message.id },
            relations: ['sender'],
        });

        console.log('✅ [SEND MESSAGE] Message saved with sender:', savedMessage?.id);

        return res.status(201).json(savedMessage);
    } catch (error: any) {
        console.error('❌ [SEND MESSAGE] Error:', error.message);
        console.error(error.stack);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Preuzmi sve poruke za određeni chat
 * GET /api/chats/:id/messages
 */
export const getChatMessages = async (req: AuthRequest, res: Response) => {
    try {
        // Parametar se zove "id" jer dolazi iz rute /:id/messages
        const { id: chatId } = req.params;
        const userId = req.user!.id;

        console.log('📨 [GET MESSAGES] Request:', { chatId, userId });

        const membershipRepository = AppDataSource.getRepository(ChatMembership);
        const messageRepository = AppDataSource.getRepository(Message);

        // Proveri da li je korisnik član chata
        const membership = await membershipRepository.findOne({
            where: { chatId, userId },
        });

        if (!membership) {
            console.log('❌ [GET MESSAGES] User not member of chat');
            return res.status(403).json({ message: 'Not a member of this chat' });
        }

        // Preuzmi sve poruke
        const messages = await messageRepository.find({
            where: { chatId, isDeleted: false },
            relations: ['sender'],
            order: { createdAt: 'ASC' },
        });

        console.log(`✅ [GET MESSAGES] Found ${messages.length} messages`);
        return res.json(messages);
    } catch (error: any) {
        console.error('❌ [GET MESSAGES] Error:', error.message);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Izmeni postojeću poruku
 * PUT /api/messages/:messageId
 */
export const editMessage = async (req: AuthRequest, res: Response) => {
    try {
        const { messageId } = req.params;
        const { content } = req.body;
        const userId = req.user!.id;

        console.log('✏️ [EDIT MESSAGE] Request:', { messageId, userId });

        if (!content || !content.trim()) {
            return res.status(400).json({ message: 'Message content is required' });
        }

        const messageRepository = AppDataSource.getRepository(Message);

        const message = await messageRepository.findOne({
            where: { id: messageId },
        });

        if (!message) {
            console.log('❌ [EDIT MESSAGE] Message not found');
            return res.status(404).json({ message: 'Message not found' });
        }

        if (message.senderId !== userId) {
            console.log('❌ [EDIT MESSAGE] Unauthorized');
            return res.status(403).json({ message: 'Not authorized to edit this message' });
        }

        message.content = content.trim();
        message.isEdited = true;
        await messageRepository.save(message);

        // Vrati poruku sa sender relacijom
        const updatedMessage = await messageRepository.findOne({
            where: { id: messageId },
            relations: ['sender'],
        });

        console.log('✅ [EDIT MESSAGE] Message updated');
        return res.json(updatedMessage);
    } catch (error: any) {
        console.error('❌ [EDIT MESSAGE] Error:', error.message);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Obriši poruku
 * DELETE /api/messages/:messageId
 */
export const deleteMessage = async (req: AuthRequest, res: Response) => {
    try {
        const { messageId } = req.params;
        const userId = req.user!.id;

        console.log('🗑️ [DELETE MESSAGE] Request:', { messageId, userId });

        const messageRepository = AppDataSource.getRepository(Message);

        const message = await messageRepository.findOne({
            where: { id: messageId },
        });

        if (!message) {
            console.log('❌ [DELETE MESSAGE] Message not found');
            return res.status(404).json({ message: 'Message not found' });
        }

        if (message.senderId !== userId) {
            console.log('❌ [DELETE MESSAGE] Unauthorized');
            return res.status(403).json({ message: 'Not authorized to delete this message' });
        }

        message.isDeleted = true;
        message.content = 'This message has been deleted';
        await messageRepository.save(message);

        console.log('✅ [DELETE MESSAGE] Message deleted');
        return res.json({ message: 'Message deleted successfully' });
    } catch (error: any) {
        console.error('❌ [DELETE MESSAGE] Error:', error.message);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Pretraži poruke u chatu
 * GET /api/messages/search?chatId=xxx&query=xxx
 */
export const searchMessages = async (req: AuthRequest, res: Response) => {
    try {
        const { chatId, query } = req.query;
        const userId = req.user!.id;

        console.log('🔍 [SEARCH MESSAGES] Request:', { chatId, query, userId });

        if (!chatId || !query) {
            return res.status(400).json({ message: 'chatId and query are required' });
        }

        const membershipRepository = AppDataSource.getRepository(ChatMembership);
        const messageRepository = AppDataSource.getRepository(Message);

        // Proveri da li je korisnik u chatu
        const membership = await membershipRepository.findOne({
            where: { chatId: chatId as string, userId },
        });

        if (!membership) {
            console.log('❌ [SEARCH MESSAGES] User not member of chat');
            return res.status(403).json({ message: 'Not a member of this chat' });
        }

        // Pretraži poruke
        const messages = await messageRepository
            .createQueryBuilder('message')
            .leftJoinAndSelect('message.sender', 'sender')
            .where('message.chatId = :chatId', { chatId })
            .andWhere('message.isDeleted = :isDeleted', { isDeleted: false })
            .andWhere('message.content ILIKE :query', { query: `%${query}%` })
            .orderBy('message.createdAt', 'DESC')
            .getMany();

        console.log(`✅ [SEARCH MESSAGES] Found ${messages.length} messages`);
        return res.json(messages);
    } catch (error: any) {
        console.error('❌ [SEARCH MESSAGES] Error:', error.message);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};