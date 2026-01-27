import 'reflect-metadata';
// 1. OVO MORA BITI PRVO - učitavanje environment variables
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { AppDataSource } from './config/database';
import { initializeSocketServer } from './socket/socketServer';
import { verifyEmailConfig } from './config/emailConfig';


// 2. TEK ONDA IMPORTUJES RUTE (koje koriste Cloudinary i druge servise)
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';
import chatRoutes from './routes/chatRoutes';
import messageRoutes from './routes/messageRoutes';
import reportRoutes from './routes/reportRoutes';
import uploadRoutes from './routes/uploadRoutes';


const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

// ===== DEBUG - Provera konfiguracije pri startu =====
console.log('\n=================================================');
console.log('🚀 STARTING CHAT APPLICATION SERVER');
console.log('=================================================');
console.log('📋 Environment Configuration:');
console.log(`   - Node Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`   - Port: ${PORT}`);
console.log(`   - Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
console.log('\n📦 Service Status:');
console.log(`   - Cloudinary Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME || '❌ Not set'}`);
console.log(`   - Cloudinary API Key: ${process.env.CLOUDINARY_API_KEY ? '✅ Configured' : '❌ Not set'}`);
console.log(`   - SMTP Email: ${process.env.SMTP_EMAIL || '❌ Not configured'}`);
console.log(`   - SMTP Password: ${process.env.SMTP_PASSWORD ? '✅ Configured' : '❌ Not set'}`);
console.log(`   - Groq API Key: ${process.env.GROQ_API_KEY ? '✅ Configured' : '❌ Not set'}`);
console.log(`   - AI Bot Enabled: ${process.env.AI_BOT_ENABLED === 'true' ? '✅ Yes' : '❌ No'}`);
console.log(`   - JWT Secret: ${process.env.JWT_SECRET ? '✅ Configured' : '❌ Not set'}`);
console.log('=================================================\n');

// ===== Middleware =====
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (za debug)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.path}`);
    next();
  });
}

// ===== Initialize Socket.IO =====
const io = initializeSocketServer(httpServer);
app.set('io', io);

// ===== API Routes =====
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes); 
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/upload', uploadRoutes);


// ===== Health Check Endpoint =====
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: AppDataSource.isInitialized ? 'Connected' : 'Disconnected',
    environment: process.env.NODE_ENV || 'development',
    services: {
      cloudinary: !!process.env.CLOUDINARY_CLOUD_NAME,
      smtp: !!process.env.SMTP_EMAIL,
      ai: process.env.AI_BOT_ENABLED === 'true',
    }
  });
});

// ===== 404 Handler =====
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// ===== Error Handler =====
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Unhandled error:', err);
  res.status(err.status || 500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ===== Database Initialization & Server Start =====
AppDataSource.initialize()
  .then(async () => {
    console.log('✅ DATABASE CONNECTED SUCCESSFULLY');
    
    // Verify email configuration
    console.log('\n📧 Verifying email configuration...');
    await verifyEmailConfig();
    
   
    
    // Start server
    httpServer.listen(PORT, () => {
      console.log('\n=================================================');
      console.log('✅ SERVER IS RUNNING');
      console.log('=================================================');
      console.log(`🌐 Server URL: http://localhost:${PORT}`);
      console.log(`📡 WebSocket: ws://localhost:${PORT}`);
      console.log(`💻 Frontend: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
      console.log(`📊 Health Check: http://localhost:${PORT}/health`);
      console.log('=================================================');
      console.log('🎉 Ready to accept connections!\n');
    });
  })
  .catch((error) => {
    console.error('\n=================================================');
    console.error('❌ DATABASE CONNECTION FAILED');
    console.error('=================================================');
    console.error('Error details:', error);
    console.error('=================================================\n');
    process.exit(1);
  });

// ===== Graceful Shutdown =====
process.on('SIGINT', async () => {
  console.log('\n\n🛑 Shutting down server gracefully...');
  
  httpServer.close(() => {
    console.log('✅ HTTP server closed');
  });
  
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
    console.log('✅ Database connection closed');
  }
  
  console.log('👋 Server shut down complete\n');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n\n🛑 SIGTERM received, shutting down...');
  
  httpServer.close(() => {
    console.log('✅ HTTP server closed');
  });
  
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
    console.log('✅ Database connection closed');
  }
  
  process.exit(0);
});

export default app;