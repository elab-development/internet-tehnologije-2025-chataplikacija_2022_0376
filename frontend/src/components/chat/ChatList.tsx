'use client';

import React, { useState } from 'react';
import { Plus, Search, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';
import { Conversation } from '@/types';
import clsx from 'clsx';

export const ChatList: React.FC = () => {
  const { conversations, selectedConversation, selectConversation } = useChat();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter((conv) => {
    if (conv.type === 'group') {
      return conv.name?.toLowerCase().includes(searchQuery.toLowerCase());
    }
    const otherParticipant = conv.participants.find((p) => p.userId !== user?.id);
    return otherParticipant?.user.username.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getConversationName = (conv: Conversation) => {
    if (conv.type === 'group') {
      return conv.name || 'Group Chat';
    }
    const otherParticipant = conv.participants.find((p) => p.userId !== user?.id);
    return otherParticipant?.user.username || 'Unknown';
  };

  const getConversationAvatar = (conv: Conversation) => {
    if (conv.type === 'group') {
      return conv.avatarUrl;
    }
    const otherParticipant = conv.participants.find((p) => p.userId !== user?.id);
    return otherParticipant?.user.avatarUrl;
  };

  const getLastMessagePreview = (conv: Conversation) => {
    if (!conv.lastMessage) return 'No messages yet';
    const preview = conv.lastMessage.isDeleted
      ? 'Message deleted'
      : conv.lastMessage.content;
    return preview.length > 50 ? `${preview.slice(0, 50)}...` : preview;
  };

  const getLastMessageTime = (conv: Conversation) => {
    if (!conv.lastMessage) return '';
    const date = new Date(conv.lastMessage.createdAt);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return format(date, 'HH:mm');
    } else if (diffInHours < 168) {
      return format(date, 'EEE');
    } else {
      return format(date, 'dd/MM/yy');
    }
  };

  const isOnline = (conv: Conversation) => {
    if (conv.type === 'group') return false;
    const otherParticipant = conv.participants.find((p) => p.userId !== user?.id);
    return otherParticipant?.user.isOnline || false;
  };

  return (
    <div className="w-80 border-r border-gray-200 bg-white flex flex-col h-screen">
      {/* Header */}
      <div className="h-16 border-b border-gray-200 px-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Chats</h1>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Edit className="h-5 w-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Plus className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="p-4">
        <Input
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={<Search className="h-5 w-5 text-gray-400" />}
        />
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchQuery ? 'No conversations found' : 'No conversations yet'}
          </div>
        ) : (
          filteredConversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => selectConversation(conv)}
              className={clsx(
                'px-4 py-3 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50',
                selectedConversation?.id === conv.id && 'bg-primary-50 hover:bg-primary-100'
              )}
            >
              <div className="flex items-start gap-3">
                <Avatar
                  src={getConversationAvatar(conv)}
                  fallbackText={getConversationName(conv)}
                  size="md"
                  status={isOnline(conv) ? 'online' : 'offline'}
                  showStatus={conv.type === 'private'}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {getConversationName(conv)}
                    </h3>
                    <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                      {getLastMessageTime(conv)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 truncate">
                      {getLastMessagePreview(conv)}
                    </p>
                    {conv.unreadCount && conv.unreadCount > 0 && (
                      <span className="ml-2 px-2 py-0.5 bg-primary-600 text-white text-xs font-medium rounded-full flex-shrink-0">
                        {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};