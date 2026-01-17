'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Message, Conversation, User } from '../../types/types';
import axios from '../../lib/axios';
import { useSocket } from '../../context/SocketContext';
import ChatHeader from './ChatHeader';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

interface ChatWindowProps {
  conversationId: string;
  currentUser: User;
  onBack?: () => void;
}

export default function ChatWindow({
  conversationId,
  currentUser,
  onBack,
}: ChatWindowProps) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMessage, setEditingMessage] = useState<{ id: string; content: string } | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportingMessageId, setReportingMessageId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reportComment, setReportComment] = useState('');
  const [showInfoModal, setShowInfoModal] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { socket } = useSocket();

  useEffect(() => {
    fetchConversationData();
  }, [conversationId]);

  useEffect(() => {
    if (!socket || !conversationId) return;

    socket.emit('join_chat', conversationId);
    console.log(`🏠 [SOCKET] Joined room: ${conversationId}`);

    const handleNewMessage = (message: Message) => {
      // PROVERA DUPLIKATA: Proveravamo da li poruka već postoji u nizu po ID-u
      setMessages((prev) => {
        const alreadyExists = prev.some((m) => m.id === message.id);
        if (alreadyExists) return prev;
        
        // Dodajemo samo ako je poruka za ovaj chat
        if (message.conversationId === conversationId || message.conversationId === conversationId) {
          return [...prev, message];
        }
        return prev;
      });
    };

    socket.on('message:new', handleNewMessage);
    socket.on('message:updated', handleMessageUpdated);
    socket.on('message:deleted', handleMessageDeleted);

    return () => {
      socket.emit('leave_chat', conversationId);
      socket.off('message:new', handleNewMessage);
      socket.off('message:updated', handleMessageUpdated);
      socket.off('message:deleted', handleMessageDeleted);
    };
  }, [socket, conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversationData = async () => {
    try {
      setLoading(true);
      const [convResponse, messagesResponse] = await Promise.all([
        axios.get(`/chats/${conversationId}`),
        axios.get(`/chats/${conversationId}/messages`),
      ]);
      
      setConversation(convResponse.data);
      setMessages(messagesResponse.data);
    } catch (error: any) {
      console.error('❌ [CHAT WINDOW] Error:', error);
      toast.error('Greška pri učitavanju konverzacije');
    } finally {
      setLoading(false);
    }
  };

  const handleMessageUpdated = (updatedMessage: Message) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === updatedMessage.id ? updatedMessage : msg))
    );
  };

  const handleMessageDeleted = (messageId: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (content: string, file?: File) => {
    try {
      if (editingMessage) {
        await axios.put(`/messages/${editingMessage.id}`, { content });
        setEditingMessage(null);
        toast.success('Poruka izmenjena');
      } else {
        if (file) {
          const formData = new FormData();
          formData.append('content', content);
          formData.append('conversationId', conversationId);
          formData.append('file', file);

          await axios.post('/messages', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        } else {
          await axios.post('/messages', {
            content,
            conversationId,
          });
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Greška pri slanju');
    }
  };

  const handleEditMessage = (messageId: string) => {
    const message = messages.find((m) => m.id === messageId);
    if (message) {
      setEditingMessage({ id: message.id, content: message.content });
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Da li želite da obrišete poruku?')) return;
    try {
      await axios.delete(`/messages/${messageId}`);
      toast.success('Poruka obrisana');
    } catch (error) {
      toast.error('Greška pri brisanju');
    }
  };

  const handleReportMessage = (messageId: string) => {
    setReportingMessageId(messageId);
    setReportModalOpen(true);
  };

  const submitReport = async () => {
    if (!reportingMessageId || !reportReason) return toast.error('Unesite razlog');
    try {
      await axios.post('/reports', {
        messageId: reportingMessageId,
        reason: reportReason,
        comment: reportComment,
      });
      toast.success('Prijavljeno');
      setReportModalOpen(false);
    } catch (error) {
      toast.error('Greška pri prijavi');
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  if (!conversation) {
    return <div className="h-full flex items-center justify-center">Čat nije pronađen.</div>;
  }

  return (
    <div className="h-full flex flex-col bg-[#F0F2F5]">
      <ChatHeader
        conversation={conversation}
        currentUser={currentUser}
        onBack={onBack}
        onOpenInfo={() => setShowInfoModal(true)}
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            Nema poruka. Recite "Zdravo!"
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwn = message.senderId === currentUser.id;
            const prevMessage = index > 0 ? messages[index - 1] : null;
            const showAvatar = !isOwn && (!prevMessage || prevMessage.senderId !== message.senderId);

            return (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={isOwn}
                showAvatar={showAvatar}
                onEdit={handleEditMessage}
                onDelete={handleDeleteMessage}
                onReport={handleReportMessage}
              />
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput
        onSendMessage={handleSendMessage}
        editingMessage={editingMessage}
        onCancelEdit={() => setEditingMessage(null)}
      />

      <Modal isOpen={reportModalOpen} onClose={() => setReportModalOpen(false)} title="Prijavi poruku">
        <div className="space-y-4 p-1">
          <Input
            label="Razlog prijave"
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            placeholder="Npr. Spam, Uvreda..."
          />
          <textarea
            value={reportComment}
            onChange={(e) => setReportComment(e.target.value)}
            className="w-full p-2 border rounded-md"
            rows={3}
            placeholder="Dodatni opis..."
          />
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setReportModalOpen(false)}>Otkaži</Button>
            <Button variant="danger" onClick={submitReport}>Prijavi</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}