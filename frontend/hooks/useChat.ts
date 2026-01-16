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

  // 1. Učitavanje svih konverzacija (Backend ruta: GET /api/chats)
  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/chats');
      setConversations(response.data);
    } catch (error) {
      console.error('Greška pri učitavanju lista ćaskanja:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Učitavanje detalja (Backend ruta: GET /api/chats/:id)
  const fetchConversation = useCallback(async (id: string) => {
    try {
      const response = await axios.get(`/chats/${id}`);
      setCurrentConversation(response.data);
    } catch (error) {
      console.error('Konverzacija nije pronađena:', error);
      toast.error('Nije moguće učitati detalje četa');
    }
  }, []);

  // 3. ISPRAVLJENO: Učitavanje poruka (Backend ruta: GET /api/messages/chat/:chatId)
  const fetchMessages = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`/messages/chat/${id}`); // Promenjena putanja
      setMessages(response.data);
    } catch (error) {
      console.error('Greška pri učitavanju poruka:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 4. ISPRAVLJENO: Slanje poruke (Usklađeno sa backend sendMessage)
  const sendMessage = useCallback(async (content: string, targetId: string, file?: File) => {
    try {
      setSending(true);
      
      // Ako tvoj backend koristi običan JSON umesto FormDate (proveri messageController)
      // Koristimo JSON jer je lakše ako nemaš pravi file upload setup spreman
      const response = await axios.post('/messages', {
        content,
        chatId: targetId, // Backend očekuje chatId
        type: file ? 'file' : 'text'
      });

      return response.data;
    } catch (error) {
      toast.error('Greška pri slanju poruke');
      throw error;
    } finally {
      setSending(false);
    }
  }, []);

  // 5. ISPRAVLJENO: Kreiranje konverzacije (Backend rute: /chats/private i /chats/group)
  const createConversation = useCallback(async (type: 'private' | 'group', participantIds: string[], name?: string) => {
    try {
      const url = type === 'private' ? '/chats/private' : '/chats/group';
      const payload = type === 'private' 
        ? { participantId: participantIds[0] } 
        : { name, participantIds };

      const response = await axios.post(url, payload);
      toast.success('Konverzacija pokrenuta');
      await fetchConversations(); 
      return response.data;
    } catch (error) {
      toast.error('Greška pri kreiranju konverzacije');
      throw error;
    }
  }, [fetchConversations]);

  // Socket listenery - Proveri da li se eventi zovu 'new_message' ili 'message:new'
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: Message) => {
      // Backend šalje 'chatId', a tvoj tip možda ima 'conversationId'
      if (message.conversationId === conversationId) {
        setMessages((prev) => [...prev, message]);
      }

      setConversations((prev) =>
        prev.map((c) => (c.id === message.conversationId ? { ...c, updatedAt: new Date().toISOString() } : c))
      );

    };

    socket.on('new_message', handleNewMessage); // Usklađeno sa tvojim socket serverom
    return () => { socket.off('new_message'); };
  }, [socket, conversationId]);

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
    sendMessage,
    createConversation,
    fetchConversations
  };
}