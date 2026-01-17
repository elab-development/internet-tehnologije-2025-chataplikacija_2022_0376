'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, Users, MessageCircle } from 'lucide-react';
import axios from '../../lib/axios';
import { Conversation, Message } from '../../types/types';
import Avatar from '../../components/ui/Avatar';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { formatMessageTime, truncateText } from '../../lib/utils';
import { cn } from '../../lib/utils';
import { useSocket } from '../../context/SocketContext';

interface ChatListProps {
  selectedConversationId?: string;
  onSelectConversation: (conversationId: string) => void;
  onNewChat: () => void;
}

export default function ChatList({
  selectedConversationId,
  onSelectConversation,
  onNewChat,
}: ChatListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  useEffect(() => {
    fetchConversations();
  }, []);

  // SOCKET: Slušanje novih poruka za ažuriranje liste sa strane
  useEffect(() => {
    if (!socket) return;

    const handleNewMessageUpdateList = (message: Message) => {
      setConversations((prev) => {
        // 1. Pronađi konverzaciju kojoj pripada poruka
        const convIndex = prev.findIndex(c => c.id === message.conversationId || c.id === message.conversationId);
        
        if (convIndex === -1) return prev; // Ako nije u listi, ne radi ništa 

        const updatedConversations = [...prev];
        const conversation = { ...updatedConversations[convIndex] };

        // 2. Ažuriraj poslednju poruku
        conversation.lastMessage = message;
        
        // 3. Povećaj unreadCount ako čat nije trenutno selektovan
        if (conversation.id !== selectedConversationId) {
          conversation.unreadCount = (conversation.unreadCount || 0) + 1;
        }

        // 4. Izbaci staru verziju i stavi osveženu na prvo mesto (vrh liste)
        updatedConversations.splice(convIndex, 1);
        return [conversation, ...updatedConversations];
      });
    };

    socket.on('message:new', handleNewMessageUpdateList);
    return () => {
      socket.off('message:new', handleNewMessageUpdateList);
    };
  }, [socket, selectedConversationId]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/chats');
      setConversations(response.data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    const conversationName = conv.name || 
      conv.participants.map(p => `${p.firstName} ${p.lastName}`).join(', ');
    return conversationName.toLowerCase().includes(searchLower);
  });

  return (
    <div className="h-full flex flex-col bg-white border-r border-dark-200">
      <div className="p-4 border-b border-dark-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-dark-900">Chatovi</h2>
          <Button variant="primary" size="sm" onClick={onNewChat} className="rounded-full w-10 h-10 p-0">
            <Plus size={20} />
          </Button>
        </div>
        <Input
          placeholder="Pretraži..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={<Search size={18} />}
          className="bg-dark-50"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-dark-400 px-4 text-center">
            <MessageCircle size={48} className="mb-4 opacity-50" />
            <p>Nema konverzacija</p>
          </div>
        ) : (
          <div className="divide-y divide-dark-100">
            {filteredConversations.map((conversation) => {
              const isGroup = conversation.type === 'group';
              // Filtriramo sebe iz učesnika da dobijemo "drugog"
              const otherParticipant = conversation.participants.find(p => p.id !== socket?.id); 
              // Napomena: Ako socket?.id ne radi, koristi currentUser.id ako ga proslediš kao prop
              
              const displayName = isGroup 
                ? conversation.name 
                : `${conversation.participants[0]?.firstName} ${conversation.participants[0]?.lastName}`;

              return (
                <div
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation.id)}
                  className={cn(
                    'flex items-center gap-3 p-4 cursor-pointer transition-colors hover:bg-gray-50',
                    conversation.id === selectedConversationId && 'bg-blue-50 hover:bg-blue-50'
                  )}
                >
                  <div className="relative">
                    {isGroup ? (
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <Users size={24} className="text-blue-600" />
                      </div>
                    ) : (
                      <Avatar
                        src={conversation.participants[0]?.avatar}
                        firstName={conversation.participants[0]?.firstName}
                        lastName={conversation.participants[0]?.lastName}
                        size="lg"
                        online={conversation.participants[0]?.isOnline}
                      />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-dark-900 truncate text-sm">{displayName}</h3>
                      {conversation.lastMessage && (
                        <span className="text-[10px] text-gray-500 flex-shrink-0">
                          {formatMessageTime(conversation.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500 truncate pr-2">
                        {conversation.lastMessage
                          ? truncateText(conversation.lastMessage.content, 30)
                          : 'Započnite razgovor'}
                      </p>
                      {conversation.unreadCount ? (
                        <span className="bg-blue-600 text-white text-[10px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center">
                          {conversation.unreadCount}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}