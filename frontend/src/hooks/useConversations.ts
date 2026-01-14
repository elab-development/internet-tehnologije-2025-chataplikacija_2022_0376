import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Conversation } from '@/types';

export const useConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getConversations();
      setConversations(response.conversations || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const createConversation = async (data: {
    type: 'private' | 'group';
    participantIds: string[];
    name?: string;
  }) => {
    try {
      const response = await api.createConversation(data);
      setConversations((prev) => [response.conversation, ...prev]);
      return response.conversation;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to create conversation');
    }
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      await api.deleteConversation(conversationId);
      setConversations((prev) => prev.filter((conv) => conv.id !== conversationId));
    } catch (err: any) {
      throw new Error(err.message || 'Failed to delete conversation');
    }
  };

  const updateConversation = (conversationId: string, updates: Partial<Conversation>) => {
    setConversations((prev) =>
      prev.map((conv) => (conv.id === conversationId ? { ...conv, ...updates } : conv))
    );
  };

  return {
    conversations,
    loading,
    error,
    loadConversations,
    createConversation,
    deleteConversation,
    updateConversation,
  };
};