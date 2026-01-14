import { Server, Socket } from 'socket.io';

export const setupTypingHandlers = (io: Server, socket: Socket) => {
  const typingUsers = new Map<string, Set<string>>();

  socket.on(
    'typing:start',
    (data: { conversationId: string; userId: string; username: string }) => {
      const { conversationId, userId, username } = data;

      // Add user to typing users for this conversation
      if (!typingUsers.has(conversationId)) {
        typingUsers.set(conversationId, new Set());
      }
      typingUsers.get(conversationId)?.add(userId);

      // Broadcast to others in the room
      socket.to(`conversation:${conversationId}`).emit('typing:user', {
        userId,
        username,
        isTyping: true,
      });

      console.log(`User ${username} started typing in ${conversationId}`);
    }
  );

  socket.on(
    'typing:stop',
    (data: { conversationId: string; userId: string }) => {
      const { conversationId, userId } = data;

      // Remove user from typing users
      typingUsers.get(conversationId)?.delete(userId);

      // Broadcast to others in the room
      socket.to(`conversation:${conversationId}`).emit('typing:user', {
        userId,
        isTyping: false,
      });

      console.log(`User ${userId} stopped typing in ${conversationId}`);
    }
  );

  // Clean up typing status when user disconnects
  socket.on('disconnect', () => {
    const userId = (socket.data as any).userId;

    // Remove user from all typing sets
    typingUsers.forEach((users, conversationId) => {
      if (users.has(userId)) {
        users.delete(userId);
        socket.to(`conversation:${conversationId}`).emit('typing:user', {
          userId,
          isTyping: false,
        });
      }
    });
  });
};