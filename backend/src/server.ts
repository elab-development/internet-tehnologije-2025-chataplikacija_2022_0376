import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes); 
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reports', reportRoutes);

// Health check ruta - služi da proveriš da li server radi
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: AppDataSource.isInitialized ? 'Connected' : 'Disconnected'
  });
});

// 1. PRVO pokrećemo HTTP server da kontejner ostane živ
httpServer.listen(PORT, () => {
  console.log(`--- SERVER IS RUNNING ON PORT ${PORT} ---`);
  console.log(`--- HEALTH CHECK: http://localhost:${PORT}/health ---`);
});

// 2. ONDA inicijalizujemo bazu u pozadini
AppDataSource.initialize()
  .then(() => {
    console.log('--- DATABASE CONNECTED SUCCESSFULLY ---');
    
    // Initialize Socket.IO nakon što je baza spremna (opciono, može i ranije)
    initializeSocketServer(httpServer);
    console.log('--- WEBSOCKET SERVER INITIALIZED ---');
  })
  .catch((error) => {
    console.error('!!! DATABASE CONNECTION FAILED !!!');
    console.error(error);
    // Ne gasimo proces (process.exit), da bismo mogli da vidimo logove
  });

export default app;