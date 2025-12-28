import 'reflect-metadata';

import express from 'express';

import cors from 'cors';

import dotenv from 'dotenv';

import { createServer } from 'http';

import { AppDataSource } from './config/database';

import { initializeSocketServer } from './socket/socketServer';

 import userRoutes from './routes/userRoutes';

// Routes

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

 

// Health check

app.get('/health', (req, res) => {

  res.json({ status: 'OK', timestamp: new Date().toISOString() });

});

 

// Initialize database and start server

AppDataSource.initialize()

  .then(() => {

    console.log('Database connected successfully');

   

    // Initialize Socket.IO

    initializeSocketServer(httpServer);

    console.log('WebSocket server initialized');

 

    httpServer.listen(PORT, () => {

      console.log(`Server running on port ${PORT}`);

    });

  })

  .catch((error) => {

    console.error('Database connection failed:', error);

    process.exit(1);

  });

 

export default app;