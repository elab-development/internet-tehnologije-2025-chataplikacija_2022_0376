import 'reflect-metadata';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app';
import { initializeDatabase } from './config/database';
import { socketConfig } from './config/socket';
import { initializeSocketHandlers } from './socket';
import { config } from 'dotenv';

config();

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new SocketIOServer(server, socketConfig);

// Setup socket handlers
initializeSocketHandlers(io);

// Export io for use in controllers
export { io };

// Start server
const startServer = async () => {
  try {
    // Initialize database
    await initializeDatabase();

    // Start HTTP server
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 WebSocket server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('⚠️  SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
});