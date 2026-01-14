import { Server, Socket } from 'socket.io';
import { AppDataSource } from '../../config/database';
import { Message } from '../../entities/Message';
import { ConversationParticipant } from '../../entities/ConversationParticipant';

export const setupMessageHandlers = (io: Server, socket: Socket) => {
  const messageRepository = AppDataSource.getRepository(Message);
  const participantRepository = AppDataSource.getRepository(ConversationParticipant);

  // Join conversation room
  socket.on('join:conversation', async (conversationId: string) => {
    try {
      const userId = (socket.data as any).userId;

      // Verify user is participant
      const participant = await participantRepository.findOne({
        where: { userId, conversationId },
      });

      if (!participant) {
        socket.emit('error', 'Not a participant of this conversation');
        return;
      }

      socket.join(`conversation:${conversationId}`);
      console.log(`User ${userId} joined conversation ${conversationId}`);
    } catch (error) {
      console.error('Error joining conversation:', error);
      socket.emit('error', 'Failed to join conversation');
    }
  });

  // Leave conversation room
  socket.on('leave:conversation', (conversationId: string) => {
    socket.leave(`conversation:${conversationId}`);
    const userId = (socket.data as any).userId;
    console.log(`User ${userId} left conversation ${conversationId}`);
  });

  // Handle new message
  socket.on('message:send', async (data: any) => {
    try {
      const userId = (socket.data as any).userId;
      const { conversationId, content } = data;

      // Verify participant
      const participant = await participantRepository.findOne({
        where: { userId, conversationId },
      });

      if (!participant) {
        socket.emit('error', 'Not authorized');
        return;
      }

      // Create message
      const message = messageRepository.create({
        content,
        senderId: userId,
        conversationId,
      });

      await messageRepository.save(message);

      // Load with relations
      const fullMessage = await messageRepository.findOne({
        where: { id: message.id },
        relations: ['sender'],
      });

      // Emit to all participants in the room
      io.to(`conversation:${conversationId}`).emit('message:new', fullMessage);
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', 'Failed to send message');
    }
  });

  // Handle message edit
  socket.on('message:edit', async (data: any) => {
    try {
      const userId = (socket.data as any).userId;
      const { messageId, content } = data;

      const message = await messageRepository.findOne({
        where: { id: messageId },
        relations: ['sender'],
      });

      if (!message) {
        socket.emit('error', 'Message not found');
        return;
      }

      if (message.senderId !== userId) {
        socket.emit('error', 'Not authorized');
        return;
      }

      message.content = content;
      message.isEdited = true;
      message.editedAt = new Date();

      await messageRepository.save(message);

      io.to(`conversation:${message.conversationId}`).emit(
        'message:edit',
        message
      );
    } catch (error) {
      console.error('Error editing message:', error);
      socket.emit('error', 'Failed to edit message');
    }
  });

  // Handle message delete
  socket.on('message:delete', async (messageId: string) => {
    try {
      const userId = (socket.data as any).userId;

      const message = await messageRepository.findOne({
        where: { id: messageId },
      });

      if (!message) {
        socket.emit('error', 'Message not found');
        return;
      }

      if (message.senderId !== userId) {
        socket.emit('error', 'Not authorized');
        return;
      }

      message.isDeleted = true;
      message.content = 'This message was deleted';

      await messageRepository.save(message);

      io.to(`conversation:${message.conversationId}`).emit(
        'message:delete',
        messageId
      );
    } catch (error) {
      console.error('Error deleting message:', error);
      socket.emit('error', 'Failed to delete message');
    }
  });
};