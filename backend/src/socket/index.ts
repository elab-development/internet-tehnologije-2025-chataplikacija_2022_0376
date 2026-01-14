import { Server, Socket } from 'socket.io';
import { setupMessageHandlers } from './handlers/message.handler';
import { setupTypingHandlers } from './handlers/typing.handler';
import { setupStatusHandlers } from './handlers/status.handler';
import { verifyAccessToken } from '../utils/jwt.util';

export const initializeSocketHandlers = (io: Server) => {
  // Authentication middleware
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = verifyAccessToken(token);
      socket.data = {
        userId: decoded.userId,
        username: decoded.email.split('@')[0],
      };

      next();
    } catch (error) {
      next(new Error('Invalid authentication token'));
    }
  });

  // Connection handler
  io.on('connection', (socket: Socket) => {
    console.log(`✅ Socket connected: ${socket.id}`);

    // Setup all handlers
    setupMessageHandlers(io, socket);
    setupTypingHandlers(io, socket);
    setupStatusHandlers(io, socket);

    // Handle connection
    const userId = (socket.data as any).userId;
    socket.emit('connected', { socketId: socket.id, userId });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  return io;
};