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
import { Loader2, UserPlus, Trash2, Shield } from 'lucide-react';

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
  const [newUserEmail, setNewUserEmail] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { socket, connected } = useSocket();

  useEffect(() => {
    console.log('📍 [CHAT WINDOW] Mounting for conversation:', conversationId);
    fetchConversationData();
  }, [conversationId]);

  useEffect(() => {
    console.log('🔌 [CHAT WINDOW] Socket effect running...');
    console.log('🔌 Socket available:', !!socket, 'Connected:', connected);

    if (!socket || !conversationId) {
      console.warn('⚠️ Socket or conversationId missing');
      return;
    }

    console.log('📍 [SOCKET] Emitting join_chat for:', conversationId);
    socket.emit('join_chat', conversationId);

    const handleNewMessage = (message: any) => {
      console.log('📨 [SOCKET] Received message:new event:', message);
      
      const msgChatId = message.conversationId || message.chatId;
      if (msgChatId === conversationId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) {
            console.log('⚠️ Message already exists, skipping');
            return prev;
          }
          console.log('✅ Adding new message to state');
          return [...prev, message];
        });
      }
    };

    const handleMessageUpdated = (updatedMessage: any) => {
      console.log('✏️ [SOCKET] Message updated:', updatedMessage.id);
      setMessages((prev) => 
        prev.map((msg) => (msg.id === updatedMessage.id ? updatedMessage : msg))
      );
    };

    const handleMessageDeleted = (data: any) => {
      console.log('🗑️ [SOCKET] Message deleted:', data);
      const deletedId = typeof data === 'string' ? data : data.id;
      setMessages((prev) => prev.filter((msg) => msg.id !== deletedId));
    };

    socket.on('message:new', handleNewMessage);
    socket.on('message:updated', handleMessageUpdated);
    socket.on('message:deleted', handleMessageDeleted);
    socket.on('message:edited', handleMessageUpdated);

    console.log('✅ [SOCKET] Event listeners registered');

    return () => {
      console.log('🔌 [SOCKET] Cleaning up, leaving room:', conversationId);
      socket.emit('leave_chat', conversationId);
      socket.off('message:new', handleNewMessage);
      socket.off('message:updated', handleMessageUpdated);
      socket.off('message:deleted', handleMessageDeleted);
      socket.off('message:edited', handleMessageUpdated);
    };
  }, [socket, connected, conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversationData = async () => {
    try {
      console.log('📥 [CHAT WINDOW] Fetching data for:', conversationId);
      setLoading(true);
      
      const [convResponse, messagesResponse] = await Promise.all([
        axios.get(`/chats/${conversationId}`),
        axios.get(`/chats/${conversationId}/messages`),
      ]);
      
      console.log('✅ [CHAT WINDOW] Conversation loaded:', convResponse.data);
      console.log('✅ [CHAT WINDOW] Messages loaded:', messagesResponse.data.length, 'messages');
      
      setConversation(convResponse.data);
      setMessages(messagesResponse.data);
    } catch (error: any) {
      console.error('❌ [CHAT WINDOW] Error loading data:', error.response?.data || error.message);
      toast.error('Greška pri učitavanju konverzacije');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (
    content: string, 
    fileData?: {
      fileUrl: string;
      fileName: string;
      fileSize: string;
      mimeType: string;
      messageType: string;
    }
  ) => {
    try {
      console.log('📤 [SEND] Sending message...', { 
        content: content?.substring(0, 50), 
        hasFile: !!fileData,
        fileType: fileData?.messageType
      });

      if (editingMessage) {
        console.log('✏️ [EDIT] Editing message:', editingMessage.id);
        await axios.put(`/messages/${editingMessage.id}`, { content });
        setEditingMessage(null);
        toast.success('Poruka izmenjena');
      } else {
        const payload: any = {
          chatId: conversationId,
          conversationId: conversationId,
        };

        if (fileData) {
          // Slanje fajla
          payload.type = fileData.messageType;
          payload.content = content || `Poslao fajl: ${fileData.fileName}`;
          payload.fileUrl = fileData.fileUrl;
          payload.fileName = fileData.fileName;
          payload.fileSize = fileData.fileSize;
          payload.mimeType = fileData.mimeType;
        } else {
          // Slanje teksta
          payload.type = 'text';
          payload.content = content;
        }

        console.log('💬 [SEND] Payload:', payload);
        const response = await axios.post('/messages', payload);
        console.log('✅ [SEND] Message sent, response:', response.data);
      }
    } catch (error: any) {
      console.error('❌ [SEND] Error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Greška pri slanju');
    }
  };

  const handleAddUser = async () => {
    if (!newUserEmail) return;
    try {
      const res = await axios.post('/chats/group/add-member', {
        chatId: conversationId,
        email: newUserEmail
      });
      setConversation(res.data);
      setNewUserEmail('');
      toast.success('Korisnik dodat!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Greška pri dodavanju');
    }
  };

  const handleRemoveUser = async (userIdToRemove: string) => {
    if (!confirm("Izbaciti korisnika?")) return;
    try {
      await axios.post('/chats/group/remove-member', { 
        chatId: conversationId, 
        userId: userIdToRemove 
      });
      setConversation((prev: any) => ({
        ...prev,
        participants: prev.participants.filter((p: any) => p.id !== userIdToRemove)
      }));
      toast.success('Korisnik izbačen.');
    } catch (error) {
      toast.error('Greška pri izbacivanju');
    }
  };

  const submitReport = async () => {
    if (!reportingMessageId || !reportReason) {
      return toast.error('Unesite razlog');
    }
    
    try {
      await axios.post('/reports', { 
        messageId: reportingMessageId, 
        reason: reportReason, 
        comment: reportComment 
      });
      toast.success('Prijavljeno');
      setReportModalOpen(false);
      setReportReason('');
      setReportComment('');
      setReportingMessageId(null);
    } catch (error) {
      toast.error('Greška pri prijavi');
    }
  };

  // Provera moderatora
  const currentUserInChat = conversation?.participants?.find((p: any) => p.id === currentUser.id) as any;
  const amIAdmin = 
    currentUserInChat?.chatRole?.toUpperCase() === 'ADMIN' || 
    currentUserInChat?.chatRole?.toUpperCase() === 'MODERATOR' ||
    currentUserInChat?.role?.toUpperCase() === 'ADMIN' ||
    currentUserInChat?.role?.toUpperCase() === 'MODERATOR';

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="h-full flex items-center justify-center">
        Čat nije pronađen.
      </div>
    );
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
                onEdit={(id) => {
                  const m = messages.find(msg => msg.id === id);
                  if (m && m.type === 'text') {
                    setEditingMessage({ id: m.id, content: m.content });
                  }
                }}
                onDelete={async (id) => {
                  if (confirm('Obrisati poruku?')) {
                    try {
                      await axios.delete(`/messages/${id}`);
                      toast.success('Poruka obrisana');
                    } catch (error) {
                      toast.error('Greška pri brisanju');
                    }
                  }
                }}
                onReport={(id) => {
                  setReportingMessageId(id);
                  setReportModalOpen(true);
                }}
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

      {/* INFO MODAL */}
      <Modal isOpen={showInfoModal} onClose={() => setShowInfoModal(false)} title="Detalji grupe">
        <div className="p-2 space-y-6">
          <div className="text-center border-b pb-4">
            <h3 className="text-xl font-bold">{conversation?.name || "Grupa"}</h3>
          </div>

          {amIAdmin && (
            <div className="flex gap-2 items-end bg-gray-50 p-3 rounded-lg border border-dashed border-gray-300">
              <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1 block font-semibold">
                  Dodaj člana (Email)
                </label>
                <input 
                  type="email" 
                  className="w-full border p-2 rounded text-sm focus:outline-none"
                  placeholder="email@primer.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                />
              </div>
              <Button onClick={handleAddUser} className="bg-blue-600 text-white h-[38px] px-4">
                <UserPlus size={18} />
              </Button>
            </div>
          )}

          <div>
            <h4 className="font-semibold mb-3 text-gray-700">
              Učesnici ({conversation?.participants?.length})
            </h4>
            <div className="space-y-2">
              {conversation?.participants?.map((participant: any) => {
                const isUserAdmin = 
                  participant.chatRole?.toUpperCase() === 'ADMIN' || 
                  participant.chatRole?.toUpperCase() === 'MODERATOR' ||
                  participant.role?.toUpperCase() === 'ADMIN' ||
                  participant.role?.toUpperCase() === 'MODERATOR';

                return (
                  <div key={participant.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                        {participant.firstName?.[0]}{participant.lastName?.[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {participant.firstName} {participant.lastName}
                        </p>
                        {isUserAdmin && (
                          <span className="text-[10px] text-blue-600 font-bold flex items-center gap-1">
                            <Shield size={10}/> MODERATOR
                          </span>
                        )}
                      </div>
                    </div>
                    {amIAdmin && participant.id !== currentUser.id && (
                      <button 
                        onClick={() => handleRemoveUser(participant.id)} 
                        className="text-red-400 hover:text-red-600 p-2"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Modal>

      {/* REPORT MODAL */}
      <Modal 
        isOpen={reportModalOpen} 
        onClose={() => {
          setReportModalOpen(false);
          setReportReason('');
          setReportComment('');
        }} 
        title="Prijavi poruku"
      >
        <div className="space-y-4 p-1">
          <Input 
            label="Razlog" 
            value={reportReason} 
            onChange={(e) => setReportReason(e.target.value)} 
            placeholder="Spam, Uvreda..." 
          />
          <textarea 
            className="w-full border p-2 rounded" 
            rows={3} 
            value={reportComment} 
            onChange={(e) => setReportComment(e.target.value)} 
            placeholder="Opis..." 
          />
          <div className="flex gap-2 justify-end">
            <Button onClick={() => {
              setReportModalOpen(false);
              setReportReason('');
              setReportComment('');
            }}>
              Otkaži
            </Button>
            <Button className="bg-red-600 text-white" onClick={submitReport}>
              Prijavi
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}