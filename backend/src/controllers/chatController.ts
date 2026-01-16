import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AppDataSource } from '../config/database';
import { Chat, ChatType } from '../entities/Chat';
import { ChatMembership, MemberRole } from '../entities/ChatMembership';
import { User } from '../entities/User';


// Pomoćna fja za formatiranje četa 
const formatChatResponse = (chat: any) => {
  if (!chat) return null;
  return {
    ...chat,
    participants: chat.memberships ? chat.memberships.map((m: any) => m.user) : [],
    messages: chat.messages || []
  };
};



export const createPrivateChat = async (req: AuthRequest, res: Response) => {
  try {
    const { participantId } = req.body;
    const currentUserId = req.user!.id;
    const chatRepository = AppDataSource.getRepository(Chat);
    const membershipRepository = AppDataSource.getRepository(ChatMembership);

    // 1. Provera da li chat već postoji
    const existingMemberships = await membershipRepository
      .createQueryBuilder('membership')
      .innerJoin('membership.chat', 'chat')
      .where('chat.type = :type', { type: ChatType.PRIVATE })
      .andWhere('membership.userId IN (:...userIds)', {
        userIds: [currentUserId, participantId],
      })
      .getMany();

    const chatIds = existingMemberships.map((m) => m.chatId);
    const chatCounts = chatIds.reduce((acc, id) => {
      acc[id] = (acc[id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const existingChatId = Object.keys(chatCounts).find((id) => chatCounts[id] === 2);

    if (existingChatId) {
      const existingChat = await chatRepository.findOne({
        where: { id: existingChatId },
        relations: ['memberships', 'memberships.user', 'messages', 'messages.sender'],
      });
      return res.json(formatChatResponse(existingChat));
    }

    // 2. Kreiranje novog privatnog četa
    const chat = chatRepository.create({ 
        type: ChatType.PRIVATE 
    });
    await chatRepository.save(chat);

    const membership1 = membershipRepository.create({
      chatId: chat.id,
      userId: currentUserId,
      role: MemberRole.MEMBER,
    });

    const membership2 = membershipRepository.create({
      chatId: chat.id,
      userId: participantId,
      role: MemberRole.MEMBER,
    });

    await membershipRepository.save([membership1, membership2]);

    const createdChat = await chatRepository.findOne({
      where: { id: chat.id },
      relations: ['memberships', 'memberships.user', 'messages', 'messages.sender'],
    });

    return res.status(201).json(formatChatResponse(createdChat));
  } catch (error) {
    console.error('Create private chat error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const createGroupChat = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, participantIds } = req.body;
    const currentUserId = req.user!.id;
    const chatRepository = AppDataSource.getRepository(Chat);
    const membershipRepository = AppDataSource.getRepository(ChatMembership);

    const chat = chatRepository.create({
      type: ChatType.GROUP,
      name,
      description,
    });
    await chatRepository.save(chat);

    // (onaj ko kreira)
    const adminMembership = membershipRepository.create({
      chatId: chat.id,
      userId: currentUserId,
      role: MemberRole.ADMIN,
    });

    // Ostali članovi
    const otherMemberships = participantIds.map((userId: string) =>
      membershipRepository.create({
        chatId: chat.id,
        userId,
        role: MemberRole.MEMBER,
      })
    );

    await membershipRepository.save([adminMembership, ...otherMemberships]);

    const createdChat = await chatRepository.findOne({
      where: { id: chat.id },
      relations: ['memberships', 'memberships.user', 'messages', 'messages.sender'],
    });

    return res.status(201).json(formatChatResponse(createdChat));
  } catch (error) {
    console.error('Create group chat error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getUserChats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const membershipRepository = AppDataSource.getRepository(ChatMembership);

    const memberships = await membershipRepository.find({
      where: { userId },
      relations: ['chat', 'chat.memberships', 'chat.memberships.user', 'chat.messages', 'chat.messages.sender'],
      order: { chat: { updatedAt: 'DESC' } },
    });

    const chats = memberships
      .filter(m => m.chat)
      .map((m) => formatChatResponse(m.chat));

    return res.json(chats);
  } catch (error) {
    console.error('Get user chats error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getChatById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const chatRepository = AppDataSource.getRepository(Chat);

    const chat = await chatRepository.findOne({
      where: { id },
      relations: ['memberships', 'memberships.user', 'messages', 'messages.sender'],
    });

    if (!chat) {
      return res.status(404).json({ message: 'Chat nije pronađen' });
    }

    return res.json(formatChatResponse(chat));
  } catch (error) {
    console.error('Get chat by ID error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const removeMemberFromGroup = async (req: AuthRequest, res: Response) => {
  try {
    const { chatId, userId } = req.body;
    const currentUserId = req.user!.id;
    const membershipRepository = AppDataSource.getRepository(ChatMembership);

    const currentUserMembership = await membershipRepository.findOne({
      where: { chatId, userId: currentUserId },
    });

    if (
      !currentUserMembership ||
      (currentUserMembership.role !== MemberRole.MODERATOR &&
        currentUserMembership.role !== MemberRole.ADMIN)
    ) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    await membershipRepository.delete({ chatId, userId });
    return res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Remove member error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
