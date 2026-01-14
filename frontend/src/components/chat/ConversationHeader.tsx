'use client';

import React from 'react';
import { Phone, Video, Search, MoreVertical, UserPlus, Settings } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Conversation } from '@/types';
import { useAuth } from '@/context/AuthContext';

interface ConversationHeaderProps {
  conversation: Conversation;
  onSearch?: () => void;
  onCall?: () => void;
  onVideoCall?: () => void;
  onAddParticipants?: () => void;
  onSettings?: () => void;
}

export const ConversationHeader: React.FC<ConversationHeaderProps> = ({
  conversation,
  onSearch,
  onCall,
  onVideoCall,
  onAddParticipants,
  onSettings,
}) => {
  const { user } = useAuth();

  const getConversationName = () => {
    if (conversation.type === 'group') {
      return conversation.name || 'Group Chat';
    }
    const otherParticipant = conversation.participants.find(
      (p) => p.userId !== user?.id
    );
    return otherParticipant?.user.username || 'Chat';
  };

  const getConversationAvatar = () => {
    if (conversation.type === 'group') {
      return conversation.avatarUrl;
    }
    const otherParticipant = conversation.participants.find(
      (p) => p.userId !== user?.id
    );
    return otherParticipant?.user.avatarUrl;
  };

  const getConversationSubtitle = () => {
    if (conversation.type === 'group') {
      return `${conversation.participants.length} members`;
    }
    const otherParticipant = conversation.participants.find(
      (p) => p.userId !== user?.id
    );
    return otherParticipant?.user.isOnline ? 'Online' : 'Offline';
  };

  const isOnline = () => {
    if (conversation.type === 'group') return false;
    const otherParticipant = conversation.participants.find(
      (p) => p.userId !== user?.id
    );
    return otherParticipant?.user.isOnline || false;
  };

  return (
    <div className="h-16 border-b border-gray-200 bg-white px-6 flex items-center justify-between">
      {/* Left side - Conversation info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Avatar
          src={getConversationAvatar()}
          fallbackText={getConversationName()}
          size="md"
          status={isOnline() ? 'online' : 'offline'}
          showStatus={conversation.type === 'private'}
        />
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-gray-900 truncate">
            {getConversationName()}
          </h2>
          <p className="text-sm text-gray-500 truncate">
            {getConversationSubtitle()}
          </p>
        </div>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-2">
        {conversation.type === 'private' && (
          <>
            <button
              onClick={onCall}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Voice call"
            >
              <Phone className="h-5 w-5 text-gray-600" />
            </button>
            <button
              onClick={onVideoCall}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Video call"
            >
              <Video className="h-5 w-5 text-gray-600" />
            </button>
          </>
        )}

        {conversation.type === 'group' && (
          <button
            onClick={onAddParticipants}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Add participants"
          >
            <UserPlus className="h-5 w-5 text-gray-600" />
          </button>
        )}

        <button
          onClick={onSearch}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Search in conversation"
        >
          <Search className="h-5 w-5 text-gray-600" />
        </button>

        <button
          onClick={onSettings}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Settings"
        >
          <MoreVertical className="h-5 w-5 text-gray-600" />
        </button>
      </div>
    </div>
  );
};