import { Server, Socket } from 'socket.io';
import { AppDataSource } from '../../config/database';
import { User } from '../../entities/User';
import { socketStore } from '../../config/socket';

export const setupStatusHandlers = (io: Server, socket: Socket) => {
  const userRepository = AppDataSource.getRepository(User);

  // User connected
  socket.on('user:connect', async (data: { userId: string; username: string }) => {
    try {
      const { userId, username } = data;

      // Store user in socket store
      socketStore.addUser(socket.id, {
        userId,
        socketId: socket.id,
        username,
      });

      // Update user status in database
      await userRepository.update(userId, {
        isOnline: true,
        lastSeenAt: new Date(),
      });

      // Broadcast to all users
      io.emit('user:status', {
        userId,
        isOnline: true,
      });

      console.log(`User ${username} (${userId}) is now online`);
    } catch (error) {
      console.error('Error handling user connect:', error);
    }
  });

  // User disconnected
  socket.on('disconnect', async () => {
    try {
      const socketUser = socketStore.getUserBySocketId(socket.id);

      if (socketUser) {
        const { userId, username } = socketUser;

        // Remove from socket store
        socketStore.removeUser(socket.id);

        // Check if user has other active connections
        const isStillOnline = socketStore.isUserOnline(userId);

        if (!isStillOnline) {
          // Update user status in database
          await userRepository.update(userId, {
            isOnline: false,
            lastSeenAt: new Date(),
          });

          // Broadcast to all users
          io.emit('user:status', {
            userId,
            isOnline: false,
            lastSeenAt: new Date(),
          });

          console.log(`User ${username} (${userId}) is now offline`);
        }
      }
    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  });

  // Manual status update
  socket.on('status:update', async (isOnline: boolean) => {
    try {
      const userId = (socket.data as any).userId;

      if (!userId) return;

      await userRepository.update(userId, {
        isOnline,
        lastSeenAt: new Date(),
      });

      io.emit('user:status', {
        userId,
        isOnline,
        ...((!isOnline && { lastSeenAt: new Date() })),
      });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  });

  // Get online users
  socket.on('users:online', (callback) => {
    const onlineUsers = socketStore.getAllUsers();
    callback(onlineUsers);
  });
};