export interface User {

    id: string;

    email: string;

    firstName: string;

    lastName: string;

    role: 'USER' | 'ADMIN' | 'MODERATOR';

    avatar?: string;

    createdAt: string;

    isOnline?: boolean;

    isSuspended?: boolean;

    suspendedUntil?: string;

}



export interface Message {

    id: string;

    content: string;

    senderId: string;

    conversationId: string;

    type: 'text' | 'file' | 'image' | 'gif';

    fileUrl?: string;

    createdAt: string;

    updatedAt?: string;

    isEdited: boolean;

    sender: User;

}



export interface Conversation {

    id: string;

    name?: string;

    type: 'private' | 'group';

    participants: User[];

    lastMessage?: Message;

    unreadCount?: number;

    createdAt: string;

    updatedAt: string;

}



export interface Report {

    id: string;

    messageId: string;

    reporterId: string;

    reason: string;

    comment?: string;

    status: 'pending' | 'reviewed' | 'resolved';

    createdAt: string;

    message: Message;

    reporter: User;

}



export interface AuthResponse {

    user: User;

    token: string;

}



export interface LoginCredentials {

    email: string;

    password: string;

}



export interface RegisterData {

    email: string;

    password: string;

    firstName: string;

    lastName: string;
}