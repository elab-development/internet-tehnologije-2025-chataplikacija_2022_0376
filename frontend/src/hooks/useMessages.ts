import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Message } from '@/types';

export const useMessages = (conversationId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (conversationId) {
      loadMessages(conversationId, 1);
    }
  }, [conversationId]);

  const loadMessages = async (convId: string, pageNum: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getMessages(convId, pageNum);
      
      if (pageNum === 1) {
        setMessages(response.messages || []);
      } else {
        setMessages((prev) => [...response.messages, ...prev]);
      }
      
      setHasMore(response.pages > pageNum);
      setPage(pageNum);
    } catch (err: any) {
      setError(err.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (conversationId && hasMore && !loading) {
      loadMessages(conversationId, page + 1);
    }
  };

  const addMessage = (message: Message) => {
    setMessages((prev) => [...prev, message]);
  };

  const updateMessage = (messageId: string, updates: Partial<Message>) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, ...updates } : msg))
    );
  };

  const removeMessage = (messageId: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
  };

  return {
    messages,
    loading,
    error,
    hasMore,
    loadMore,
    addMessage,
    updateMessage,
    removeMessage,
  };
};