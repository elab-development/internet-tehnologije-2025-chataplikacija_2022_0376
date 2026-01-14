import { Server as SocketIOServer, ServerOptions } from 'socket.io';
import { env } from './env';

export const socketConfig: Partial<ServerOptions> = {
  cors: {
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST'],
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
  connectTimeout: 45000,
  maxHttpBufferSize: 1e6, // 1MB
  allowEIO3: true,
};

export interface SocketUser {
  userId: string;
  socketId: string;
  username: string;
}

// In-memory storage for connected users
export class SocketStore {
  private users: Map<string, SocketUser> = new Map();

  addUser(socketId: string, user: SocketUser): void {
    this.users.set(socketId, user);
  }

  removeUser(socketId: string): SocketUser | undefined {
    const user = this.users.get(socketId);
    this.users.delete(socketId);
    return user;
  }

  getUserBySocketId(socketId: string): SocketUser | undefined {
    return this.users.get(socketId);
  }

  getUsersByUserId(userId: string): SocketUser[] {
    return Array.from(this.users.values()).filter(
      (user) => user.userId === userId
    );
  }

  getAllUsers(): SocketUser[] {
    return Array.from(this.users.values());
  }

  isUserOnline(userId: string): boolean {
    return this.getUsersByUserId(userId).length > 0;
  }
}

export const socketStore = new SocketStore();