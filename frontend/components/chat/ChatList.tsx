'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, Users, MessageCircle, Shield } from 'lucide-react';
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
  currentUser: User;
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
        
        if (convIndex === -1) {
          fetchConversations();
          return prev;
        } 

        const updatedConversations = [...prev];
        const conversation = { ...updatedConversations[convIndex] };

        conversation.lastMessage = message;
        conversation.updatedAt = message.createdAt;
        
        if (conversation.id !== selectedConversationId) {
          conversation.unreadCount = (conversation.unreadCount || 0) + 1;
        }

        updatedConversations.splice(convIndex, 1);
        return [conversation, ...updatedConversations];
      });
    };

    socket.on('message:new', handleNewMessageUpdateList);
    socket.on('chat:created', () => fetchConversations());

    return () => {
      socket.off('message:new', handleNewMessageUpdateList);
      socket.off('chat:created');
    };
  }, [socket, selectedConversationId]);

  const fetchConversations = async () => {
    try {
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
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Poruke</h2>
          <Button variant="ghost" size="sm" onClick={onNewChat} className="rounded-full w-8 h-8 p-0 hover:bg-gray-100">
            <Plus size={18} className="text-gray-600" />
          </Button>
        </div>
        <div className="relative">
          <Input
            placeholder="Pretraži razgovore..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-gray-50 border-none pl-10 h-10 text-sm"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 px-4 text-center">
            <MessageCircle size={32} className="mb-2 opacity-10" />
            <p className="text-xs">Nema pronađenih čatova</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {filteredConversations.map((conversation) => {
              const isGroup = conversation.type === 'group';
              const otherParticipant = conversation.participants.find(p => p.id !== currentUser.id);
              const isModerator = otherParticipant?.role?.toUpperCase() === 'MODERATOR' || otherParticipant?.role?.toUpperCase() === 'ADMIN';
              
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
                    'flex items-center gap-3 p-4 cursor-pointer transition-all border-l-4 border-transparent',
                    conversation.id === selectedConversationId 
                      ? 'bg-blue-50/50 border-blue-600' 
                      : 'hover:bg-gray-50'
                  )}
                >
                  <div className="relative flex-shrink-0">
                    {isGroup ? (
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center ring-2 ring-white">
                        <Users size={22} className="text-blue-600" />
                      </div>
                    ) : (
                      <Avatar
                        src={otherParticipant?.avatar}
                        firstName={otherParticipant?.firstName}
                        lastName={otherParticipant?.lastName}
                        size="lg"
                        online={otherParticipant?.isOnline}
                      />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <h3 className={cn(
                          "text-sm truncate",
                          conversation.unreadCount || !conversation.lastMessage ? "font-bold text-gray-900" : "font-medium text-gray-700"
                        )}>{displayName}</h3>
                        {!isGroup && isModerator && (
                          <Shield size={12} className="text-blue-600 fill-blue-50 flex-shrink-0" />
                        )}
                      </div>
                      {conversation.lastMessage && (
                        <span className="text-[10px] text-gray-400 font-medium">
                          {formatMessageTime(conversation.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className={cn(
                        "text-xs truncate pr-4 max-w-[180px]",
                        conversation.unreadCount ? "text-blue-600 font-semibold" : "text-gray-500"
                      )}>
                        {conversation.lastMessage
                          ? truncateText(conversation.lastMessage.content, 40)
                          : 'Nova konverzacija'}
                      </p>
                      {conversation.unreadCount ? (
                        <span className="bg-blue-600 text-white text-[10px] font-bold rounded-full h-5 min-w-[20px] px-1.5 flex items-center justify-center shadow-sm">
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