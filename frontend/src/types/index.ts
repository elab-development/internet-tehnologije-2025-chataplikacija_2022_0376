export interface User {

  id: string;

  email: string;

  firstName: string;

  lastName: string;

  role: 'user' | 'moderator' | 'admin';

  status: 'active' | 'suspended' | 'banned';

  isOnline: boolean;

  lastSeen?: string;

  profilePicture?: string;

}

 

export interface Chat {

  id: string;

  type: 'private' | 'group';

  name?: string;

  description?: string;

  groupImage?: string;

  memberships: ChatMembership[];

  messages?: Message[];

  createdAt: string;

  updatedAt: string;

}

 

export interface ChatMembership {

  id: string;

  userId: string;

  chatId: string;

  role: 'member' | 'moderator' | 'admin';

  user: User;

}

 

export interface Message {

  id: string;

  senderId: string;

  chatId: string;

  type: 'text' | 'file' | 'gif';

  content: string;

  fileUrl?: string;

  fileName?: string;

  isEdited: boolean;

  isDeleted: boolean;

  sender: User;

  createdAt: string;

  updatedAt: string;

}

 

export interface MessageReport {

  id: string;

  messageId: string;

  reporterId: string;

  reason: 'spam' | 'harassment' | 'hate_speech' | 'inappropriate_content' | 'other';

  additionalComment?: string;

  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';

  message: Message;

  reporter: User;

  reviewedBy?: User;

  reviewNotes?: string;

  createdAt: string;

}