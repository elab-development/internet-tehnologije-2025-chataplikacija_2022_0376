'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Message, Conversation, User } from '../../types/types';
import axios from '../../lib/axios';
import { useSocket } from '../../context/SocketContext';
import ChatHeader from './ChatHeader';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import NewChatModal from './NewChatModal';
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
    if (!socket) return;

    socket.on('message:new', handleNewMessage);
    socket.on('message:updated', handleMessageUpdated);
    socket.on('message:deleted', handleMessageDeleted);

    return () => {
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
    } catch (error) {
      console.error('Error fetching conversation:', error);
      toast.error('Greška pri učitavanju konverzacije');
    } finally {
      setLoading(false);
    }
  };

  const handleNewMessage = (message: Message) => {
    if (message.conversationId === conversationId) {
      setMessages((prev) => [...prev, message]);
    }
  };

  const handleMessageUpdated = (updatedMessage: Message) => {
    if (updatedMessage.conversationId === conversationId) {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === updatedMessage.id ? updatedMessage : msg))
      );
    }
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
        // Update existing message
        await axios.put(`/messages/${editingMessage.id}`, { content });
        setEditingMessage(null);
        toast.success('Poruka izmenjena');
      } else {
        // Send new message
        const formData = new FormData();
        formData.append('content', content);
        formData.append('conversationId', conversationId);
        
        if (file) {
          formData.append('file', file);
        }

        await axios.post('/messages', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Greška pri slanju poruke');
    }
  };

  const handleEditMessage = (messageId: string) => {
    const message = messages.find((m) => m.id === messageId);
    if (message) {
      setEditingMessage({ id: message.id, content: message.content });
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Da li ste sigurni da želite da obrišete poruku?')) return;

    try {
      await axios.delete(`/messages/${messageId}`);
      toast.success('Poruka obrisana');
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Greška pri brisanju poruke');
    }
  };

  const handleReportMessage = (messageId: string) => {
    setReportingMessageId(messageId);
    setReportModalOpen(true);
  };

  const submitReport = async () => {
    if (!reportingMessageId || !reportReason) {
      toast.error('Molimo unesite razlog prijave');
      return;
    }

    try {
      await axios.post('/reports', {
        messageId: reportingMessageId,
        reason: reportReason,
        comment: reportComment,
      });
      
      toast.success('Poruka prijavljena');
      setReportModalOpen(false);
      setReportingMessageId(null);
      setReportReason('');
      setReportComment('');
    } catch (error) {
      console.error('Error reporting message:', error);
      toast.error('Greška pri prijavljivanju poruke');
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-dark-50">
        <Loader2 className="animate-spin text-primary-600" size={40} />
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="h-full flex items-center justify-center bg-dark-50">
        <p className="text-dark-600">Konverzacija nije pronađena</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-dark-50">
      {/* Header */}
      <ChatHeader
        conversation={conversation}
        currentUser={currentUser}
        onBack={onBack}
        onOpenInfo={() => setShowInfoModal(true)}
      />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-dark-400">
            <p>Nema poruka. Započnite konverzaciju!</p>
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

      {/* Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        editingMessage={editingMessage}
        onCancelEdit={() => setEditingMessage(null)}
      />

      {/* Report Modal */}
      <Modal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        title="Prijavi poruku"
      >
        <div className="space-y-4">
          <Input
            label="Razlog prijave"
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            placeholder="Spam, uvredljiv sadržaj, itd."
          />
          <div>
            <label className="block text-sm font-medium text-dark-700 mb-2">
              Dodatni komentar (opciono)
            </label>
            <textarea
              value={reportComment}
              onChange={(e) => setReportComment(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 rounded-lg border border-dark-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Opišite problem detaljnije..."
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setReportModalOpen(false)}>
              Otkaži
            </Button>
            <Button variant="danger" onClick={submitReport}>
              Prijavi
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
} 