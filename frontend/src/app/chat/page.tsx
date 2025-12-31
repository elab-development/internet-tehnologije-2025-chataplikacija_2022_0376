'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import NavBar from '../../components/NavBar';
import ChatList from '../../components/ChatList';
import MessageList from '../../components/MessageList';
import MessageInput from '../../components/MessageInput';
import NewChatModal from '../../components/NewChatModal';
import { Chat, Message } from '../../types';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const ChatPage: React.FC = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchChats();
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (selectedChatId) {
      fetchMessages();
    }
  }, [selectedChatId]);

  const fetchChats = async () => {
    try {
      setLoadingChats(true);
      const response = await api.get('/chats');
      setChats(response.data || []);
    } catch (error) {
      toast.error('Greška pri učitavanju čat-ova');
      console.error(error);
    } finally {
      setLoadingChats(false);
    }
  };

  const fetchMessages = async () => {
    try {
      setLoadingMessages(true);
      const response = await api.get(`/messages/${selectedChatId}`);
      setMessages(response.data || []);
    } catch (error) {
      toast.error('Greška pri učitavanju poruka');
      console.error(error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async (content: string, type: 'text' | 'file' | 'gif', fileData?: any) => {
    try {
      if (!selectedChatId) return;
      
      const payload = { content, type, chatId: selectedChatId, fileData };
      await api.post('/messages', payload);
      
      fetchMessages();
    } catch (error) {
      toast.error('Greška pri slanju poruke');
      console.error(error);
    }
  };

  const handleEditMessage = async (message: Message) => {
    // Implementacija edit-a
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await api.delete(`/messages/${messageId}`);
      fetchMessages();
    } catch (error) {
      toast.error('Greška pri brisanju poruke');
      console.error(error);
    }
  };

  const handleReportMessage = async (message: Message) => {
    try {
      await api.post('/reports', { messageId: message.id });
      toast.success('Poruka je prijavljena');
    } catch (error) {
      toast.error('Greška pri prijavi poruke');
      console.error(error);
    }
  };

  if (loading || !user) {
    return <div className="flex items-center justify-center min-h-screen">Učitavanje...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <NavBar />
      <div className="flex flex-1 overflow-hidden">
        {/* Chat lista */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <button
              onClick={() => setShowNewChatModal(true)}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Novi čat
            </button>
          </div>
          <ChatList
            chats={chats}
            selectedChatId={selectedChatId}
            onSelectChat={setSelectedChatId}
            onNewChat={() => setShowNewChatModal(true)}
          />
        </div>

        {/* Poruke i input */}
        {selectedChatId ? (
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto">
              <MessageList
                messages={messages}
                onEditMessage={handleEditMessage}
                onDeleteMessage={handleDeleteMessage}
                onReportMessage={handleReportMessage}
              />
            </div>
            <MessageInput
              onSendMessage={handleSendMessage}
              disabled={loadingMessages}
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <p className="text-gray-400 text-lg">Izaberite čat za nastavak</p>
          </div>
        )}
      </div>

      {/* Novi čat modal */}
      <NewChatModal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        onChatCreated={() => {
          setShowNewChatModal(false);
          fetchChats();
        }}
      />
    </div>
  );
};

export default ChatPage;
