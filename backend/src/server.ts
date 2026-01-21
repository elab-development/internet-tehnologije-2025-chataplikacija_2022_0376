import 'reflect-metadata';
// 1. OVO MORA BITI PRVO
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { AppDataSource } from './config/database';
import { initializeSocketServer } from './socket/socketServer';

// 2. TEK ONDA IMPORTUJES RUTE (koje koriste Cloudinary)
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';
import chatRoutes from './routes/chatRoutes';
import messageRoutes from './routes/messageRoutes';
import reportRoutes from './routes/reportRoutes';
import uploadRoutes from './routes/uploadRoutes';

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

// DEBUG - Provera ključeva pri startu
console.log("--- PROVERA CLOUDINARY KLJUČEVA ---");
console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("API Key postoji:", !!process.env.CLOUDINARY_API_KEY);
console.log("----------------------------------");

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const io = initializeSocketServer(httpServer);
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes); 
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: AppDataSource.isInitialized ? 'Connected' : 'Disconnected'
  });
});

AppDataSource.initialize()
  .then(() => {
    console.log('--- DATABASE CONNECTED SUCCESSFULLY ---');
    httpServer.listen(PORT, () => {
      console.log(`--- SERVER IS RUNNING ON PORT ${PORT} ---`);
    });
  })
  .catch((error) => {
    console.error('!!! DATABASE CONNECTION FAILED !!!', error);
  });

export default app;