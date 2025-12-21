import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';

// Tipizacija socket-a sa userId i user
interface AuthenticatedSocket extends Socket {
  userId: string;
  user?: User;
}

export const initializeSocketServer = (httpServer: HTTPServer) => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    const authSocket = socket as AuthenticatedSocket;

    try {
      const token = authSocket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({ where: { id: decoded.userId } });

      if (!user) {
        return next(new Error('User not found'));
      }

      authSocket.userId = user.id;
      authSocket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const authSocket = socket as AuthenticatedSocket;
    console.log(`User connected: ${authSocket.userId}`);

    // Join user's personal room
    authSocket.join(`user:${authSocket.userId}`);

    // Join chat room
    authSocket.on('join_chat', (chatId: string) => {
      authSocket.join(`chat:${chatId}`);
      console.log(`User ${authSocket.userId} joined chat ${chatId}`);
    });

    // Leave chat room
    authSocket.on('leave_chat', (chatId: string) => {
      authSocket.leave(`chat:${chatId}`);
      console.log(`User ${authSocket.userId} left chat ${chatId}`);
    });

    // Send message
    authSocket.on('send_message', (data: { chatId: string; [key: string]: any }) => {
      io.to(`chat:${data.chatId}`).emit('new_message', data);
    });

    // Edit message
    authSocket.on('edit_message', (data: { chatId: string; [key: string]: any }) => {
      io.to(`chat:${data.chatId}`).emit('message_edited', data);
    });

    // Delete message
    authSocket.on('delete_message', (data: { chatId: string; [key: string]: any }) => {
      io.to(`chat:${data.chatId}`).emit('message_deleted', data);
    });

    // Typing indicator
    authSocket.on('typing_start', (data: { chatId: string; userName: string }) => {
      authSocket.to(`chat:${data.chatId}`).emit('user_typing', {
        userId: authSocket.userId,
        userName: data.userName,
      });
    });

    authSocket.on('typing_stop', (data: { chatId: string }) => {
      authSocket.to(`chat:${data.chatId}`).emit('user_stopped_typing', {
        userId: authSocket.userId,
      });
    });

    // Disconnect
    authSocket.on('disconnect', async () => {
      console.log(`User disconnected: ${authSocket.userId}`);

      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({ where: { id: authSocket.userId } });

      if (user) {
        user.isOnline = false;
        user.lastSeen = new Date();
        await userRepository.save(user);
      }
    });
  });

  return io;
};
