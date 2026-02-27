import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { AppDataSource } from './config/database';
import { initializeSocketServer } from './socket/socketServer';

// --- SWAGGER IMPORTS ---
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// --- ROUTE IMPORTS ---
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';
import chatRoutes from './routes/chatRoutes';
import messageRoutes from './routes/messageRoutes';
import reportRoutes from './routes/reportRoutes';
import uploadRoutes from './routes/uploadRoutes';

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

// ===== SWAGGER KOMPLETNA SPECIFIKACIJA =====
const swaggerOptions: swaggerJsDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Chat Application API',
      version: '1.0.0',
      description: 'API specifikacija za chat aplikaciju - Seminarski rad',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Lokalni razvojni server',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token',
        },
      },
    },
    paths: {
      // --- AUTH ---
      '/api/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Registracija novog korisnika',
          requestBody: {
            content: { 'application/json': { schema: { type: 'object', properties: { username: { type: 'string' }, email: { type: 'string' }, password: { type: 'string' } } } } }
          },
          responses: { 201: { description: 'Uspešna registracija' } }
        }
      },
      '/api/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Prijava na sistem',
          requestBody: {
            content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' }, password: { type: 'string' } } } } }
          },
          responses: { 200: { description: 'Uspešna prijava' } }
        }
      },
      '/api/auth/logout': {
        post: { tags: ['Auth'], summary: 'Odjava korisnika', responses: { 200: { description: 'Uspešna odjava' } } }
      },
      '/api/auth/me': {
        get: { tags: ['Auth'], summary: 'Podaci o ulogovanom korisniku', responses: { 200: { description: 'Podaci vraćeni' } } }
      },
      '/api/auth/forgot-password': {
        post: {
          tags: ['Auth'],
          summary: 'Zahtev za reset lozinke',
          requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' } } } } } },
          responses: { 200: { description: 'Email poslat' } }
        }
      },
      // --- USERS ---
      '/api/users': {
        get: { tags: ['Users'], summary: 'Pretraga korisnika', responses: { 200: { description: 'Lista korisnika' } } }
      },
      '/api/auth/admin/users': {
        get: { tags: ['Users'], summary: 'Pregled svih korisnika (Admin)', responses: { 200: { description: 'Lista za admina' } } }
      },
      // --- CHATS ---
      '/api/chats': {
        get: { tags: ['Chats'], summary: 'Svi četovi ulogovanog korisnika', responses: { 200: { description: 'Lista četova' } } },
        post: {
          tags: ['Chats'],
          summary: 'Kreiranje novog četa',
          requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { participantId: { type: 'string' } } } } } },
          responses: { 201: { description: 'Čet kreiran' } }
        }
      },
      // --- MESSAGES ---
      '/api/messages/{chatId}': {
        get: {
          tags: ['Messages'],
          summary: 'Preuzimanje istorije poruka',
          parameters: [{ name: 'chatId', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Lista poruka' } }
        }
      },
      '/api/messages/send': {
        post: {
          tags: ['Messages'],
          summary: 'Slanje poruke',
          requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { chatId: { type: 'string' }, content: { type: 'string' } } } } } },
          responses: { 201: { description: 'Poruka poslata' } }
        }
      },
      // --- REPORTS & UPLOAD ---
      '/api/reports': {
        post: {
          tags: ['Reports'],
          summary: 'Prijava neprikladnog sadržaja',
          requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { reportedId: { type: 'string' }, reason: { type: 'string' } } } } } },
          responses: { 201: { description: 'Prijava primljena' } }
        }
      },
      '/api/upload': {
        post: {
          tags: ['Upload'],
          summary: 'Upload fajla (slike)',
          responses: { 200: { description: 'Fajl uspešno otpremljen' } }
        }
      },
      '/health': {
        get: { tags: ['Sistemske rute'], summary: 'Status servera', responses: { 200: { description: 'Server OK' } } }
      }
    }
  },
  apis: [],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

// ===== MIDDLEWARE =====
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger UI ruta
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// ===== SOCKET INITIALIZATION =====
const io = initializeSocketServer(httpServer);
app.set('io', io);

// ===== API ROUTES BINDING =====
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes); 
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/upload', uploadRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', database: AppDataSource.isInitialized ? 'Connected' : 'Disconnected' });
});

// ===== DATABASE & START SERVER =====
AppDataSource.initialize()
  .then(async () => {
    console.log('✅ DATABASE CONNECTED SUCCESSFULLY');
    httpServer.listen(PORT, () => {
      console.log(`\n🚀 SERVER RUNNING ON: http://localhost:${PORT}`);
      console.log(`📖 SWAGGER DOCS: http://localhost:${PORT}/api-docs\n`);
    });
  })
  .catch((error) => {
    console.error('❌ DATABASE CONNECTION FAILED:', error);
    process.exit(1);
  });

export default app;