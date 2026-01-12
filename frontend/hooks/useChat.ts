'use client';

import { useState, useEffect, useCallback } from 'react';
import { Conversation, Message } from 'types/types';
import axios from 'lib/axios';
import { useSocket } from 'hooks/useSocket';
import toast from 'react-hot-toast';

export function useChat(conversationId?: string) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const { socket } = useSocket();

  // Fetch all conversations
  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/conversations');
      setConversations(response.data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Greška pri učitavanju konverzacija');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch specific conversation
  const fetchConversation = useCallback(async (id: string) => {
    try {
      const response = await axios.get(`/conversations/${id}`);
      setCurrentConversation(response.data);
    } catch (error) {
      console.error('Error fetching conversation:', error);
      toast.error('Greška pri učitavanju konverzacije');
    }
  }, []);

  // Fetch messages for conversation
  const fetchMessages = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`/conversations/${id}/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Greška pri učitavanju poruka');
    } finally {
      setLoading(false);
    }
  }, []);

  // Send message
  const sendMessage = useCallback(async (
    content: string,
    conversationId: string,
    file?: File
  ) => {
    try {
      setSending(true);
      const formData = new FormData();
      formData.append('content', content);
      formData.append('conversationId', conversationId);
      
      if (file) {
        formData.append('file', file);
      }

      const response = await axios.post('/messages', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Greška pri slanju poruke');
      throw error;
    } finally {
      setSending(false);
    }
  }, []);

  // Update message
  const updateMessage = useCallback(async (messageId: string, content: string) => {
    try {
      const response = await axios.put(`/messages/${messageId}`, { content });
      toast.success('Poruka izmenjena');
      return response.data;
    } catch (error) {
      console.error('Error updating message:', error);
      toast.error('Greška pri izmeni poruke');
      throw error;
    }
  }, []);

  // Delete message
  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      await axios.delete(`/messages/${messageId}`);
      toast.success('Poruka obrisana');
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Greška pri brisanju poruke');
      throw error;
    }
  }, []);

  // Create conversation
  const createConversation = useCallback(async (
    type: 'private' | 'group',
    participantIds: string[],
    name?: string
  ) => {
    try {
      const response = await axios.post('/conversations', {
        type,
        participantIds,
        name,
      });
      toast.success('Konverzacija kreirana');
      return response.data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Greška pri kreiranju konverzacije');
      throw error;
    }
  }, []);

  // Report message
  const reportMessage = useCallback(async (
    messageId: string,
    reason: string,
    comment?: string
  ) => {
    try {
      await axios.post('/reports', {
        messageId,
        reason,
        comment,
      });
      toast.success('Poruka prijavljena');
    } catch (error) {
      console.error('Error reporting message:', error);
      toast.error('Greška pri prijavljivanju poruke');
      throw error;
    }
  }, []);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: Message) => {
      setMessages((prev) => [...prev, message]);
      
      // Update conversation's last message
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === message.conversationId
            ? { ...conv, lastMessage: message, updatedAt: message.createdAt }
            : conv
        )
      );
    };

    const handleMessageUpdated = (message: Message) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === message.id ? message : msg))
      );
    };

    const handleMessageDeleted = (messageId: string) => {
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    };

    const handleConversationUpdated = (conversation: Conversation) => {
      setConversations((prev) =>
        prev.map((conv) => (conv.id === conversation.id ? conversation : conv))
      );
      
      if (currentConversation?.id === conversation.id) {
        setCurrentConversation(conversation);
      }
    };

    socket.on('message:new', handleNewMessage);
    socket.on('message:updated', handleMessageUpdated);
    socket.on('message:deleted', handleMessageDeleted);
    socket.on('conversation:updated', handleConversationUpdated);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('message:updated', handleMessageUpdated);
      socket.off('message:deleted', handleMessageDeleted);
      socket.off('conversation:updated', handleConversationUpdated);
    };
  }, [socket, currentConversation]);

  // Fetch data on mount or when conversationId changes
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (conversationId) {
      fetchConversation(conversationId);
      fetchMessages(conversationId);
    }
  }, [conversationId, fetchConversation, fetchMessages]);

  return {
    conversations,
    currentConversation,
    messages,
    loading,
    sending,
    fetchConversations,
    fetchConversation,
    fetchMessages,
    sendMessage,
    updateMessage,
    deleteMessage,
    createConversation,
    reportMessage,
  };
}