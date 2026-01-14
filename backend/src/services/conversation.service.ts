import { AppDataSource } from '../config/database';
import { Conversation, ConversationType } from '../entities/Conversation';
import { ConversationParticipant } from '../entities/ConversationParticipant';
import { User } from '../entities/User';
import { In } from 'typeorm';

export class ConversationService {
  private conversationRepository = AppDataSource.getRepository(Conversation);
  private participantRepository = AppDataSource.getRepository(ConversationParticipant);
  private userRepository = AppDataSource.getRepository(User);

  async getUserConversations(userId: string): Promise<Conversation[]> {
    const conversations = await this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.participants', 'participant')
      .leftJoinAndSelect('participant.user', 'user')
      .leftJoinAndSelect('conversation.messages', 'message')
      .where('participant.userId = :userId', { userId })
      .orderBy('conversation.updatedAt', 'DESC')
      .getMany();

    // Get last message for each conversation
    for (const conv of conversations) {
      if (conv.messages && conv.messages.length > 0) {
        conv.messages.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        (conv as any).lastMessage = conv.messages[0];
      }
    }

    return conversations;
  }

  async getConversationById(
    conversationId: string,
    userId: string
  ): Promise<Conversation> {
    // Check if user is participant
    const participant = await this.participantRepository.findOne({
      where: { userId, conversationId },
    });

    if (!participant) {
      throw new Error('User is not a participant of this conversation');
    }

    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['participants', 'participants.user', 'moderators'],
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    return conversation;
  }

  async createPrivateConversation(
    userId: string,
    otherUserId: string
  ): Promise<Conversation> {
    // Check if conversation already exists
    const existingConversation = await this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoin('conversation.participants', 'p1')
      .leftJoin('conversation.participants', 'p2')
      .where('conversation.type = :type', { type: ConversationType.PRIVATE })
      .andWhere('p1.userId = :userId', { userId })
      .andWhere('p2.userId = :otherUserId', { otherUserId })
      .getOne();

    if (existingConversation) {
      return existingConversation;
    }

    // Create new conversation
    const conversation = this.conversationRepository.create({
      type: ConversationType.PRIVATE,
      createdBy: userId,
    });

    await this.conversationRepository.save(conversation);

    // Add participants
    const participants = [userId, otherUserId].map((uid) =>
      this.participantRepository.create({
        userId: uid,
        conversationId: conversation.id,
      })
    );

    await this.participantRepository.save(participants);

    // Load with relations
    return await this.getConversationById(conversation.id, userId);
  }

  async createGroupConversation(data: {
    name: string;
    description?: string;
    createdBy: string;
    participantIds: string[];
  }): Promise<Conversation> {
    if (data.participantIds.length < 2) {
      throw new Error('Group must have at least 2 participants');
    }

    // Create conversation
    const conversation = this.conversationRepository.create({
      type: ConversationType.GROUP,
      name: data.name,
      description: data.description,
      createdBy: data.createdBy,
    });

    await this.conversationRepository.save(conversation);

    // Add creator as moderator
    const creator = await this.userRepository.findOne({
      where: { id: data.createdBy },
    });
    if (creator) {
      conversation.moderators = [creator];
      await this.conversationRepository.save(conversation);
    }

    // Add all participants including creator
    const allParticipants = [...new Set([...data.participantIds, data.createdBy])];
    const participants = allParticipants.map((uid) =>
      this.participantRepository.create({
        userId: uid,
        conversationId: conversation.id,
      })
    );

    await this.participantRepository.save(participants);

    return await this.getConversationById(conversation.id, data.createdBy);
  }

  async addParticipants(
    conversationId: string,
    userIds: string[],
    requestUserId: string
  ): Promise<void> {
    const conversation = await this.getConversationById(conversationId, requestUserId);

    if (conversation.type !== ConversationType.GROUP) {
      throw new Error('Can only add participants to group conversations');
    }

    // Check if requester is moderator
    const isModerator = conversation.moderators?.some((mod) => mod.id === requestUserId);
    if (!isModerator) {
      throw new Error('Only moderators can add participants');
    }

    // Add new participants
    const newParticipants = userIds.map((uid) =>
      this.participantRepository.create({
        userId: uid,
        conversationId,
      })
    );

    await this.participantRepository.save(newParticipants);
  }

  async removeParticipant(
    conversationId: string,
    userIdToRemove: string,
    requestUserId: string
  ): Promise<void> {
    const conversation = await this.getConversationById(conversationId, requestUserId);

    if (conversation.type !== ConversationType.GROUP) {
      throw new Error('Can only remove participants from group conversations');
    }

    // Check if requester is moderator
    const isModerator = conversation.moderators?.some((mod) => mod.id === requestUserId);
    if (!isModerator) {
      throw new Error('Only moderators can remove participants');
    }

    await this.participantRepository.delete({
      userId: userIdToRemove,
      conversationId,
    });
  }

  async deleteConversation(conversationId: string, userId: string): Promise<void> {
    const conversation = await this.getConversationById(conversationId, userId);

    // Only creator can delete
    if (conversation.createdBy !== userId) {
      throw new Error('Only the creator can delete this conversation');
    }

    await this.conversationRepository.delete(conversationId);
  }
}