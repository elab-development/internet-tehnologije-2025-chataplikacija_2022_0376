import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AppDataSource } from '../config/database';
import { Chat, ChatType } from '../entities/Chat';
import { ChatMembership, MemberRole } from '../entities/ChatMembership';
import { User } from '../entities/User';

export const createPrivateChat = async (req: AuthRequest, res: Response) => {
  try {
    const { participantId } = req.body;
    const currentUserId = req.user!.id;
    const chatRepository = AppDataSource.getRepository(Chat);
    const membershipRepository = AppDataSource.getRepository(ChatMembership);

    // Check if private chat already exists
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

        relations: ['memberships', 'memberships.user'],

      });

      return res.json(existingChat);

    }

 

    // Create new private chat

    const chat = chatRepository.create({

      type: ChatType.PRIVATE,

    });

    await chatRepository.save(chat);

 

    // Add members

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

      relations: ['memberships', 'memberships.user'],

    });

 

    res.status(201).json(createdChat);

  } catch (error) {

    console.error('Create private chat error:', error);

    res.status(500).json({ message: 'Server error' });

  }

};

 

export const createGroupChat = async (req: AuthRequest, res: Response) => {

  try {

    const { name, description, participantIds } = req.body;

    const currentUserId = req.user!.id;

 

    const chatRepository = AppDataSource.getRepository(Chat);

    const membershipRepository = AppDataSource.getRepository(ChatMembership);

 

    // Create group chat

    const chat = chatRepository.create({

      type: ChatType.GROUP,

      name,

      description,

    });

    await chatRepository.save(chat);

 

    // Add creator as admin

    const adminMembership = membershipRepository.create({

      chatId: chat.id,

      userId: currentUserId,

      role: MemberRole.ADMIN,

    });

 

    // Add other participants

    const memberships = participantIds.map((userId: string) =>

      membershipRepository.create({

        chatId: chat.id,

        userId,

        role: MemberRole.MEMBER,

      })

    );

 

    await membershipRepository.save([adminMembership, ...memberships]);

 

    const createdChat = await chatRepository.findOne({

      where: { id: chat.id },

      relations: ['memberships', 'memberships.user'],

    });

 

    res.status(201).json(createdChat);

  } catch (error) {

    console.error('Create group chat error:', error);

    res.status(500).json({ message: 'Server error' });

  }

};

 

export const getUserChats = async (req: AuthRequest, res: Response) => {

  try {

    const userId = req.user!.id;

    const membershipRepository = AppDataSource.getRepository(ChatMembership);

 

    const memberships = await membershipRepository.find({

      where: { userId },

      relations: ['chat', 'chat.memberships', 'chat.memberships.user', 'chat.messages'],

      order: { chat: { updatedAt: 'DESC' } },

    });

 

    const chats = memberships.map((m) => m.chat);

 

    res.json(chats);

  } catch (error) {

    console.error('Get user chats error:', error);

    res.status(500).json({ message: 'Server error' });

  }

};

 

export const removeMemberFromGroup = async (req: AuthRequest, res: Response) => {

  try {

    const { chatId, userId } = req.body;

    const currentUserId = req.user!.id;

 

    const membershipRepository = AppDataSource.getRepository(ChatMembership);

 

    // Check if current user is moderator or admin

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
    // Remove member
    await membershipRepository.delete({ chatId, userId });
    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ message: 'Server error' });

  }

};