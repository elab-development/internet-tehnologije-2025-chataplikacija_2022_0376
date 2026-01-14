// User types
export enum UserRole {
  USER = 'user',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  avatarUrl?: string | null;
  isOnline: boolean;
  lastSeenAt?: Date | null;
  isSuspended: boolean;
  suspensionEndDate?: Date | null;
  suspensionReason?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Conversation types
export enum ConversationType {
  PRIVATE = 'private',
  GROUP = 'group',
}

export interface Conversation {
  id: string;
  type: ConversationType;
  name?: string | null;
  description?: string | null;
  avatarUrl?: string | null;
  createdBy?: string | null;
  participants: ConversationParticipant[];
  lastMessage?: Message | null;
  unreadCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationParticipant {
  userId: string;
  conversationId: string;
  user: User;
  lastReadAt?: Date | null;
  isMuted: boolean;
  isPinned: boolean;
  joinedAt: Date;
}

// Message types
export enum MessageType {
  TEXT = 'text',
  FILE = 'file',
  IMAGE = 'image',
  VIDEO = 'video',
}

export interface Message {
  id: string;
  content: string;
  type: MessageType;
  fileUrl?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  isEdited: boolean;
  isDeleted: boolean;
  isPinned: boolean;
  senderId: string;
  sender: User;
  conversationId: string;
  editedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Report types
export enum ReportReason {
  SPAM = 'spam',
  HARASSMENT = 'harassment',
  HATE_SPEECH = 'hate_speech',
  INAPPROPRIATE_CONTENT = 'inappropriate_content',
  VIOLENCE = 'violence',
  OTHER = 'other',
}

export enum ReportStatus {
  PENDING = 'pending',
  REVIEWING = 'reviewing',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed',
}

export interface MessageReport {
  id: string;
  reason: ReportReason;
  comment?: string | null;
  status: ReportStatus;
  messageId: string;
  message: Message;
  reporterId: string;
  reporter: User;
  reviewerId?: string | null;
  reviewer?: User | null;
  reviewComment?: string | null;
  reviewedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pages: number;
}

// Socket event types
export interface SocketEvents {
  'message:new': (message: Message) => void;
  'message:edit': (message: Message) => void;
  'message:delete': (messageId: string) => void;
  'typing:user': (data: { userId: string; username: string; isTyping: boolean }) => void;
  'user:status': (data: { userId: string; isOnline: boolean }) => void;
}