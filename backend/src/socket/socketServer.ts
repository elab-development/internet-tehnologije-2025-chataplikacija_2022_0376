import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  userId: string;
  email?: string;
}

export const initializeSocketServer = (httpServer: HttpServer) => {
  console.log('🔌 Initializing Socket.IO server...');
  
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling']
  });

  // Mapa za praćenje online korisnika
  const onlineUsers = new Map<string, string>(); 

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      console.log('🔐 Socket auth attempt:', { 
        socketId: socket.id, 
        hasToken: !!token 
      });

      if (!token) {
        console.error('❌ No token provided');
        return next(new Error('Authentication error: No token'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
      
      console.log('✅ Token verified for user:', decoded.userId);
      
      // Attach userId to socket
      (socket as any).userId = decoded.userId;
      next();
    } catch (error: any) {
      console.error('❌ Socket authentication error:', error.message);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const userId = (socket as any).userId;
    
    console.log(`🔌 Socket connected:`, { 
      socketId: socket.id, 
      userId 
    });

    if (userId) {
      onlineUsers.set(userId, socket.id);
      socket.join(userId); // Join personal room
      console.log(`👤 User ${userId} is now online.`);
      io.emit('user_online', userId);
    }

    socket.on('join_chat', (chatId: string) => {
      socket.join(chatId);
      console.log(`🏠 User ${userId} joined chat room: ${chatId}`);
    });

    socket.on('leave_chat', (chatId: string) => {
      socket.leave(chatId);
      console.log(`🚪 User ${userId} left chat room: ${chatId}`);
    });

    socket.on('typing', (chatId: string) => {
      console.log(`⌨️ User ${userId} typing in chat ${chatId}`);
      socket.to(chatId).emit('typing', { userId, chatId });
    });

    socket.on('stop_typing', (chatId: string) => {
      socket.to(chatId).emit('stop_typing', { userId, chatId });
    });

    socket.on('disconnect', () => {
      if (userId) {
        onlineUsers.delete(userId);
        console.log(`❌ User ${userId} disconnected.`);
        io.emit('user_offline', userId);
      }
    });
  });

  console.log('✅ Socket.IO server initialized');
  return io;
};