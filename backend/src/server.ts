import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { AppDataSource } from './config/database';
import { initializeSocketServer } from './socket/socketServer';

// Routes
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';
import chatRoutes from './routes/chatRoutes';
import messageRoutes from './routes/messageRoutes';
import reportRoutes from './routes/reportRoutes';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ KLJUČNI DEO - Initialize Socket.IO
const io = initializeSocketServer(httpServer);

// ✅ KLJUČNI DEO - Attach Socket.IO to Express app
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes); 
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reports', reportRoutes);

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: AppDataSource.isInitialized ? 'Connected' : 'Disconnected'
  });
});

// Database & Server Start
AppDataSource.initialize()
  .then(() => {
    console.log('--- DATABASE CONNECTED SUCCESSFULLY ---');
    
    // ✅ Inicijalizuj Socket.IO NAKON što je baza povezana
    httpServer.listen(PORT, () => {
      console.log(`--- SERVER IS RUNNING ON PORT ${PORT} ---`);
      console.log(`--- WEBSOCKET SERVER READY ---`);
      console.log(`--- Socket.IO listening on ws://localhost:${PORT} ---`);
    });
  })
  .catch((error) => {
    console.error('!!! DATABASE CONNECTION FAILED !!!');
    console.error(error);
  });

  // server.ts
app.use('/api/auth', authRoutes);
app.use('/api/admin', authRoutes); // Dodaj ovo - sada authRoutes reaguje i na /api/admin

export default app;