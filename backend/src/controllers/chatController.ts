import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AppDataSource } from '../config/database';
import { Chat, ChatType } from '../entities/Chat';
import { ChatMembership, MemberRole } from '../entities/ChatMembership';
import { User } from '../entities/User';

// Fja koja ubacuje ulogu
const formatChatResponse = (chat: any) => {
  if (!chat) return null;
  return {
    ...chat,
    participants: chat.memberships 
      ? chat.memberships.map((m: any) => ({
          ...m.user,      
          chatRole: m.role 
        })) 
      : [],
    messages: chat.messages || []
  };
};

export const createPrivateChat = async (req: AuthRequest, res: Response) => {
  try {
    const { participantId } = req.body;
    const currentUserId = req.user!.id;
    const chatRepository = AppDataSource.getRepository(Chat);
    const membershipRepository = AppDataSource.getRepository(ChatMembership);

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

    const chat = chatRepository.create({ type: ChatType.PRIVATE });
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

    // Kreator je ADMIN
    const adminMembership = membershipRepository.create({
      chatId: chat.id,
      userId: currentUserId,
      role: MemberRole.ADMIN,
    });

    // Ostali su MEMBERS
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

export const addMemberToGroup = async (req: AuthRequest, res: Response) => {
  try {
    const { chatId, email } = req.body; // Korisnika tražimo po emailu
    const currentUserId = req.user!.id;

    const membershipRepository = AppDataSource.getRepository(ChatMembership);
    const userRepository = AppDataSource.getRepository(User);
    const chatRepository = AppDataSource.getRepository(Chat);

    const currentUserMembership = await membershipRepository.findOne({
      where: { chatId, userId: currentUserId },
    });

    if (!currentUserMembership || (currentUserMembership.role !== MemberRole.ADMIN && currentUserMembership.role !== MemberRole.MODERATOR)) {
      return res.status(403).json({ message: 'Nemate dozvolu za dodavanje članova.' });
    }

    const userToAdd = await userRepository.findOne({ where: { email } });
    if (!userToAdd) {
      return res.status(404).json({ message: 'Korisnik sa tim emailom ne postoji.' });
    }

    const existingMembership = await membershipRepository.findOne({
      where: { chatId, userId: userToAdd.id }
    });

    if (existingMembership) {
      return res.status(400).json({ message: 'Korisnik je već u grupi.' });
    }

    const newMembership = membershipRepository.create({
      chatId,
      userId: userToAdd.id,
      role: MemberRole.MEMBER,
    });

    await membershipRepository.save(newMembership);

    const updatedChat = await chatRepository.findOne({
      where: { id: chatId },
      relations: ['memberships', 'memberships.user', 'messages', 'messages.sender'],
    });

    return res.json(formatChatResponse(updatedChat));
  } catch (error) {
    console.error('Add member error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// --- FUNKCIJA: Izbacivanje člana ---
export const removeMemberFromGroup = async (req: AuthRequest, res: Response) => {
  try {
    const { chatId, userId } = req.body; // userId onoga koga izbacujemo
    const currentUserId = req.user!.id;
    const membershipRepository = AppDataSource.getRepository(ChatMembership);
    
    // 1. Provera: Ko si ti?
    const currentUserMembership = await membershipRepository.findOne({
      where: { chatId, userId: currentUserId },
    });

    if (
      !currentUserMembership ||
      (currentUserMembership.role !== MemberRole.MODERATOR &&
        currentUserMembership.role !== MemberRole.ADMIN)
    ) {
      return res.status(403).json({ message: 'Nemate dozvolu za izbacivanje.' });
    }

    // 2. Obriši membership onoga koga izbacujemo
    await membershipRepository.delete({ chatId, userId });
    
    return res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Remove member error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};