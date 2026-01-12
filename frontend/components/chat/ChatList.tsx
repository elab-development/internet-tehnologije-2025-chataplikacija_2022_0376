'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, Users, MessageCircle } from 'lucide-react';
import axios from '../../lib/axios';
import { Conversation } from '../../types/types';
import Avatar from '../../components/ui/Avatar';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { formatMessageTime, truncateText } from '../../lib/utils';
import { cn } from '../../lib/utils';

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

  useEffect(() => {
    fetchConversations();
  }, []);

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
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    const conversationName = conv.name || 
      conv.participants.map(p => `${p.firstName} ${p.lastName}`).join(', ');
    
    return conversationName.toLowerCase().includes(searchLower);
  });

  return (
    <div className="h-full flex flex-col bg-white border-r border-dark-200">
      {/* Header */}
      <div className="p-4 border-b border-dark-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-dark-900">Chatovi</h2>
          <Button
            variant="primary"
            size="sm"
            onClick={onNewChat}
            className="rounded-full w-10 h-10 p-0"
          >
            <Plus size={20} />
          </Button>
        </div>
        
        <Input
          placeholder="Pretraži ili započni novi chat"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={<Search size={18} />}
          className="bg-dark-50"
        />
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-dark-400 px-4 text-center">
            <MessageCircle size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Nema konverzacija</p>
            <p className="text-sm">Započnite novi chat klikom na + dugme</p>
          </div>
        ) : (
          <div className="divide-y divide-dark-100">
            {filteredConversations.map((conversation) => {
              const isGroup = conversation.type === 'group';
              const otherParticipant = conversation.participants[0];
              const displayName = isGroup 
                ? conversation.name 
                : `${otherParticipant?.firstName} ${otherParticipant?.lastName}`;
              
              const isSelected = conversation.id === selectedConversationId;

              return (
                <div
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation.id)}
                  className={cn(
                    'flex items-center gap-3 p-4 cursor-pointer transition-colors',
                    'hover:bg-dark-50',
                    isSelected && 'bg-primary-50 hover:bg-primary-100'
                  )}
                >
                  {/* Avatar */}
                  <div className="relative">
                    {isGroup ? (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                        <Users size={24} className="text-white" />
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

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-dark-900 truncate">
                        {displayName}
                      </h3>
                      {conversation.lastMessage && (
                        <span className="text-xs text-dark-500 ml-2 flex-shrink-0">
                          {formatMessageTime(conversation.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-dark-600 truncate">
                        {conversation.lastMessage
                          ? truncateText(conversation.lastMessage.content, 35)
                          : 'Nema poruka'}
                      </p>
                      {conversation.unreadCount && conversation.unreadCount > 0 && (
                        <span className="ml-2 flex-shrink-0 bg-primary-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                          {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                        </span>
                      )}
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