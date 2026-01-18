'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, Users, MessageCircle } from 'lucide-react';
import axios from '../../lib/axios';
import { Conversation, Message, User } from '../../types/types';
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
  currentUser: User; // Dodat prop za ispravnu identifikaciju
}

export default function ChatList({
  selectedConversationId,
  onSelectConversation,
  onNewChat,
  currentUser
}: ChatListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessageUpdateList = (message: Message) => {
      setConversations((prev) => {
        const convId = message.conversationId || (message as any).conversationId;
        const convIndex = prev.findIndex(c => c.id === convId);
        
        if (convIndex === -1) return prev; 

        const updatedConversations = [...prev];
        const conversation = { ...updatedConversations[convIndex] };

        conversation.lastMessage = message;
        
        if (conversation.id !== selectedConversationId) {
          conversation.unreadCount = (conversation.unreadCount || 0) + 1;
        }

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
    const searchLower = searchQuery.toLowerCase();
    const otherParticipant = conv.participants.find(p => p.id !== currentUser.id);
    const displayName = conv.type === 'group' 
      ? conv.name 
      : `${otherParticipant?.firstName} ${otherParticipant?.lastName}`;
    
    return displayName?.toLowerCase().includes(searchLower);
  });

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Poruke</h2>
          <Button variant="primary" size="sm" onClick={onNewChat} className="rounded-full w-9 h-9 p-0">
            <Plus size={18} />
          </Button>
        </div>
        <Input
          placeholder="Pretraži razgovore..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={<Search size={16} />}
          className="bg-gray-50 border-none"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 px-4 text-center">
            <MessageCircle size={40} className="mb-2 opacity-20" />
            <p className="text-sm">Nema pronađenih čatova</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filteredConversations.map((conversation) => {
              const isGroup = conversation.type === 'group';
              const otherParticipant = conversation.participants.find(p => p.id !== currentUser.id);
              
              const displayName = isGroup 
                ? conversation.name 
                : otherParticipant 
                  ? `${otherParticipant.firstName} ${otherParticipant.lastName}`
                  : 'Korisnik';

              return (
                <div
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation.id)}
                  className={cn(
                    'flex items-center gap-3 p-4 cursor-pointer transition-all hover:bg-gray-50',
                    conversation.id === selectedConversationId && 'bg-blue-50'
                  )}
                >
                  <div className="relative">
                    {isGroup ? (
                      <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center">
                        <Users size={20} className="text-blue-600" />
                      </div>
                    ) : (
                      <Avatar
                        src={otherParticipant?.avatar}
                        firstName={otherParticipant?.firstName}
                        lastName={otherParticipant?.lastName}
                        size="md"
                        online={otherParticipant?.isOnline}
                      />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h3 className={cn(
                        "font-semibold text-sm truncate",
                        conversation.unreadCount ? "text-gray-900" : "text-gray-700"
                      )}>{displayName}</h3>
                      {conversation.lastMessage && (
                        <span className="text-[10px] text-gray-400">
                          {formatMessageTime(conversation.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className={cn(
                        "text-xs truncate pr-2",
                        conversation.unreadCount ? "text-blue-600 font-medium" : "text-gray-500"
                      )}>
                        {conversation.lastMessage
                          ? truncateText(conversation.lastMessage.content, 35)
                          : 'Nova konverzacija'}
                      </p>
                      {conversation.unreadCount ? (
                        <span className="bg-blue-600 text-white text-[10px] font-bold rounded-full h-4 min-w-[16px] px-1.5 flex items-center justify-center">
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