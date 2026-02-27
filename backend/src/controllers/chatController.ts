import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AppDataSource } from '../config/database';
import { Chat, ChatType } from '../entities/Chat';
import { ChatMembership, MemberRole } from '../entities/ChatMembership';
import { User } from '../entities/User';
import { Message } from '../entities/Message';

const formatChatResponse = (chat: any) => {
  if (!chat) return null;
  
  // Eksplicitno formatiraj poruke da uključe kompletnog sender-a
  const formattedMessages = chat.messages?.map((message: any) => {
    // Ako message već ima sender objekat, koristi ga
    if (message.sender) {
      return {
        ...message,
        sender: {
          id: message.sender.id,
          email: message.sender.email,
          firstName: message.sender.firstName,
          lastName: message.sender.lastName,
          avatar: message.sender.avatar,
          role: message.sender.role
        }
      };
    }
    
    // Ako nema sender objekat, probaj da ga nađeš među učesnicima
    const senderFromParticipants = chat.memberships?.find(
      (m: any) => m.user?.id === message.senderId
    )?.user;
    
    return {
      ...message,
      sender: senderFromParticipants ? {
        id: senderFromParticipants.id,
        email: senderFromParticipants.email,
        firstName: senderFromParticipants.firstName,
        lastName: senderFromParticipants.lastName,
        avatar: senderFromParticipants.avatar,
        role: senderFromParticipants.role
      } : {
        id: message.senderId,
        firstName: 'Nepoznati',
        lastName: 'Korisnik',
        email: ''
      }
    };
  }) || [];
  
  // Poslednja poruka za prikaz u listi
  const lastMessage = formattedMessages.length > 0 
    ? formattedMessages[formattedMessages.length - 1] 
    : null;
  
  return {
    id: chat.id,
    type: chat.type,
    name: chat.name,
    description: chat.description,
    createdAt: chat.createdAt,
    updatedAt: chat.updatedAt,
    participants: chat.memberships 
      ? chat.memberships.map((m: any) => ({
          id: m.user.id,
          email: m.user.email,
          firstName: m.user.firstName,
          lastName: m.user.lastName,
          avatar: m.user.avatar,
          role: m.user.role,
          isOnline: m.user.isOnline,
          lastSeen: m.user.lastSeen,
          chatRole: m.role,
          joinedAt: m.joinedAt
        })).sort((a: any, b: any) => {
          if (a.chatRole === 'admin') return -1;
          if (b.chatRole === 'admin') return 1;
          if (a.chatRole === 'moderator') return -1;
          if (b.chatRole === 'moderator') return 1;
          return 0;
        })
      : [],
    messages: formattedMessages,
    lastMessage: lastMessage,
    unreadCount: 0 
  };
};

export const createPrivateChat = async (req: AuthRequest, res: Response) => {
  try {
    const { participantId } = req.body;
    const currentUserId = req.user!.id;
    const chatRepository = AppDataSource.getRepository(Chat);
    const membershipRepository = AppDataSource.getRepository(ChatMembership);

    // Proveri da li već postoji privatni chat između ova dva korisnika
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
        order: { messages: { createdAt: 'ASC' } }
      });
      return res.json(formatChatResponse(existingChat));
    }

    // Kreiraj novi chat
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
      order: { messages: { createdAt: 'ASC' } }
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
      order: { messages: { createdAt: 'ASC' } }
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
      order: { messages: { createdAt: 'ASC' } }
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
    const { chatId, email } = req.body;
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
      order: { messages: { createdAt: 'ASC' } }
    });

    return res.json(formatChatResponse(updatedChat));
  } catch (error) {
    console.error('Add member error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const removeMemberFromGroup = async (req: AuthRequest, res: Response) => {
  try {
    const { chatId, userId } = req.body;
    const currentUserId = req.user!.id;
    const membershipRepository = AppDataSource.getRepository(ChatMembership);
    const chatRepository = AppDataSource.getRepository(Chat);
    
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

    await membershipRepository.delete({ chatId, userId });
    
    const updatedChat = await chatRepository.findOne({
      where: { id: chatId },
      relations: ['memberships', 'memberships.user', 'messages', 'messages.sender'],
      order: { messages: { createdAt: 'ASC' } }
    });

    return res.json(formatChatResponse(updatedChat));
  } catch (error) {
    console.error('Remove member error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Dodatna funkcija za brisanje chata (samo admin)
export const deleteChat = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    
    const chatRepository = AppDataSource.getRepository(Chat);
    const membershipRepository = AppDataSource.getRepository(ChatMembership);
    
    const membership = await membershipRepository.findOne({
      where: { chatId: id, userId }
    });
    
    if (!membership || (membership.role !== MemberRole.ADMIN)) {
      return res.status(403).json({ message: 'Samo admin može obrisati chat' });
    }
    
    await chatRepository.delete(id);
    
    return res.json({ message: 'Chat uspešno obrisan' });
  } catch (error) {
    console.error('Delete chat error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};