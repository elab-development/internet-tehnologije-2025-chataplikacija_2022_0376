import { User } from '../entities/User';
import { Message } from '../entities/Message';

export interface SocketData {
  user?: User;
  userId?: string;
}

export interface ServerToClientEvents {
  'message:new': (message: Message) => void;
  'message:edit': (message: Message) => void;
  'message:delete': (messageId: string) => void;
  'typing:user': (data: TypingData) => void;
  'user:status': (data: UserStatusData) => void;
  'conversation:updated': (conversationId: string) => void;
  error: (error: string) => void;
}

export interface ClientToServerEvents {
  'join:conversation': (conversationId: string) => void;
  'leave:conversation': (conversationId: string) => void;
  'typing:start': (data: TypingStartData) => void;
  'typing:stop': (data: TypingStopData) => void;
  'status:update': (isOnline: boolean) => void;
}

export interface TypingData {
  userId: string;
  username?: string;
  isTyping: boolean;
}

export interface TypingStartData {
  conversationId: string;
  userId: string;
  username: string;
}

export interface TypingStopData {
  conversationId: string;
  userId: string;
}

export interface UserStatusData {
  userId: string;
  isOnline: boolean;
  lastSeenAt?: Date;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId: string;
  username: string;
}