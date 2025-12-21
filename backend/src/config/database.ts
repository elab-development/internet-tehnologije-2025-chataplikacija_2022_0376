import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Chat } from '../entities/Chat';
import { ChatMembership } from '../entities/ChatMembership';
import { Message } from '../entities/Message';
import { MessageReport } from '../entities/MessageReport';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'chat_db',
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  entities: [User, Chat, ChatMembership, Message, MessageReport],
  migrations: ['src/migrations/*.ts'],
  subscribers: [],
});
