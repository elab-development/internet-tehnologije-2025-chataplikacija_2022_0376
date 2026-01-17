import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';

export const initializeSocketServer = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Mapa za praćenje online korisnika
  const onlineUsers = new Map<string, string>(); // userId -> socketId

  io.on('connection', (socket) => {
    console.log(`🔌 Novi socket povezan: ${socket.id}`);

    // Autentifikacija korisnika na socketu
    socket.on('setup', (userData: { id: string }) => {
      if (userData?.id) {
        socket.join(userData.id);
        onlineUsers.set(userData.id, socket.id);
        console.log(`👤 Korisnik ${userData.id} je sada online.`);
        io.emit('user_online', userData.id);
      }
    });

    // Pridruživanje konkretnom chatu (sobi)
    socket.on('join_chat', (chatId: string) => {
      socket.join(chatId);
      console.log(`🏠 Socket ${socket.id} ušao u sobu: ${chatId}`);
    });

    // Napuštanje sobe
    socket.on('leave_chat', (chatId: string) => {
      socket.leave(chatId);
      console.log(`🚪 Socket ${socket.id} izašao iz sobe: ${chatId}`);
    });

    // Indikator kucanja (Typing...)
    socket.on('typing', (chatId: string) => {
      socket.in(chatId).emit('typing', chatId);
    });

    socket.on('stop_typing', (chatId: string) => {
      socket.in(chatId).emit('stop_typing', chatId);
    });

    // Diskonekcija
    socket.on('disconnect', () => {
      let disconnectedUserId: string | null = null;
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          disconnectedUserId = userId;
          onlineUsers.delete(userId);
          break;
        }
      }
      
      if (disconnectedUserId) {
        console.log(`❌ Korisnik ${disconnectedUserId} je offline.`);
        io.emit('user_offline', disconnectedUserId);
      }
    });
  });

  return io;
};