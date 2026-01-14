import { AppDataSource } from '../config/database';
import { Message, MessageType } from '../entities/Message';
import { ConversationParticipant } from '../entities/ConversationParticipant';

export class MessageService {
  private messageRepository = AppDataSource.getRepository(Message);
  private participantRepository = AppDataSource.getRepository(ConversationParticipant);

  async getMessagesByConversation(
    conversationId: string,
    userId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<{ messages: Message[]; total: number; pages: number }> {
    // Check if user is participant
    const participant = await this.participantRepository.findOne({
      where: { userId, conversationId },
    });

    if (!participant) {
      throw new Error('User is not a participant of this conversation');
    }

    const skip = (page - 1) * limit;

    const [messages, total] = await this.messageRepository.findAndCount({
      where: { conversationId, isDeleted: false },
      relations: ['sender'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      messages: messages.reverse(), // Oldest first
      total,
      pages: Math.ceil(total / limit),
    };
  }

  async sendMessage(data: {
    conversationId: string;
    senderId: string;
    content: string;
    type?: MessageType;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
  }): Promise<Message> {
    // Check if user is participant
    const participant = await this.participantRepository.findOne({
      where: { userId: data.senderId, conversationId: data.conversationId },
    });

    if (!participant) {
      throw new Error('User is not a participant of this conversation');
    }

    const message = this.messageRepository.create({
      content: data.content,
      type: data.type || MessageType.TEXT,
      fileUrl: data.fileUrl,
      fileName: data.fileName,
      fileSize: data.fileSize,
      senderId: data.senderId,
      conversationId: data.conversationId,
    });

    await this.messageRepository.save(message);

    // Load sender relation
    return await this.messageRepository.findOne({
      where: { id: message.id },
      relations: ['sender'],
    }) as Message;
  }

  async editMessage(
    messageId: string,
    userId: string,
    newContent: string
  ): Promise<Message> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['sender'],
    });

    if (!message) {
      throw new Error('Message not found');
    }

    if (message.senderId !== userId) {
      throw new Error('You can only edit your own messages');
    }

    if (message.isDeleted) {
      throw new Error('Cannot edit deleted message');
    }

    message.content = newContent;
    message.isEdited = true;
    message.editedAt = new Date();

    return await this.messageRepository.save(message);
  }

  async deleteMessage(messageId: string, userId: string): Promise<void> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
    });

    if (!message) {
      throw new Error('Message not found');
    }

    if (message.senderId !== userId) {
      throw new Error('You can only delete your own messages');
    }

    message.isDeleted = true;
    message.content = 'This message was deleted';

    await this.messageRepository.save(message);
  }

  async searchMessages(
    conversationId: string,
    userId: string,
    query: string
  ): Promise<Message[]> {
    // Check if user is participant
    const participant = await this.participantRepository.findOne({
      where: { userId, conversationId },
    });

    if (!participant) {
      throw new Error('User is not a participant of this conversation');
    }

    return await this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .where('message.conversationId = :conversationId', { conversationId })
      .andWhere('message.isDeleted = false')
      .andWhere('LOWER(message.content) LIKE LOWER(:query)', {
        query: `%${query}%`,
      })
      .orderBy('message.createdAt', 'DESC')
      .take(50)
      .getMany();
  }
}