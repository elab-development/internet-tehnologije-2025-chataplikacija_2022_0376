'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { api } from '@/lib/api';
import { Conversation, Message } from '@/types';
import { useAuth } from './AuthContext';

interface ChatContextType {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  messages: Message[];
  loading: boolean;
  selectConversation: (conversation: Conversation) => void;
  sendMessage: (content: string) => Promise<void>;
  editMessage: (messageId: string, content: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  refreshConversations: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | null>(null);

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider = ({ children }: ChatProviderProps): JSX.Element => {
  const { isAuthenticated } = useAuth();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  /* =======================
     LOAD CONVERSATIONS
     ======================= */
  useEffect(() => {
    if (isAuthenticated) {
      loadConversations();
    }
  }, [isAuthenticated]);

  /* =======================
     LOAD MESSAGES
     ======================= */
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id, 1);
    }
  }, [selectedConversation]);

  const loadConversations = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await api.getConversations();
      setConversations(response.conversations ?? []);
    } catch (error) {
      console.error('Failed to load conversations', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (
    conversationId: string,
    page: number
  ): Promise<void> => {
    try {
      setLoading(true);
      const response = await api.getMessages(conversationId, page);

      if (page === 1) {
        setMessages(response.messages ?? []);
      } else {
        setMessages((prev) => [...(response.messages ?? []), ...prev]);
      }

      setHasMore(response.pages > page);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to load messages', error);
    } finally {
      setLoading(false);
    }
  };

  const selectConversation = (conversation: Conversation): void => {
    setSelectedConversation(conversation);
    setCurrentPage(1);
    setHasMore(true);
  };

  const sendMessage = async (content: string): Promise<void> => {
    if (!selectedConversation || !content.trim()) return;

    await api.sendMessage({
      conversationId: selectedConversation.id,
      content: content.trim(),
    });
  };

  const editMessage = async (
    messageId: string,
    content: string
  ): Promise<void> => {
    await api.editMessage(messageId, content);
  };

  const deleteMessage = async (messageId: string): Promise<void> => {
    await api.deleteMessage(messageId);
  };

  const loadMoreMessages = async (): Promise<void> => {
    if (!selectedConversation || !hasMore || loading) return;
    await loadMessages(selectedConversation.id, currentPage + 1);
  };

  const refreshConversations = async (): Promise<void> => {
    await loadConversations();
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        selectedConversation,
        messages,
        loading,
        selectConversation,
        sendMessage,
        editMessage,
        deleteMessage,
        loadMoreMessages,
        refreshConversations,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);

  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }

  return context;
};
