'use client';

import React from 'react';
import { Phone, Video, MoreVertical, ArrowLeft, Users } from 'lucide-react';
import { Conversation, User } from '../../types';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';

interface ChatHeaderProps {
  conversation: Conversation;
  currentUser: User;
  onBack?: () => void;
  onOpenInfo: () => void;
}

export default function ChatHeader({
  conversation,
  currentUser,
  onBack,
  onOpenInfo,
}: ChatHeaderProps) {
  const isGroup = conversation.type === 'group';
  const otherParticipant = conversation.participants.find(p => p.id !== currentUser.id);
  
  const displayName = isGroup
    ? conversation.name
    : otherParticipant
    ? `${otherParticipant.firstName} ${otherParticipant.lastName}`
    : 'Chat';

  const statusText = isGroup
    ? `${conversation.participants.length} učesnika`
    : otherParticipant?.isOnline
    ? 'Online'
    : 'Offline';

  return (
    <div className="h-16 bg-white border-b border-dark-200 flex items-center justify-between px-4">
      {/* Left Section */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {onBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="lg:hidden -ml-2"
          >
            <ArrowLeft size={20} />
          </Button>
        )}

        <div
          className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
          onClick={onOpenInfo}
        >
          {isGroup ? (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center flex-shrink-0">
              <Users size={20} className="text-white" />
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

          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-dark-900 truncate">{displayName}</h2>
            <p className="text-xs text-dark-500">{statusText}</p>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="hidden sm:flex">
          <Video size={20} />
        </Button>
        <Button variant="ghost" size="sm" className="hidden sm:flex">
          <Phone size={20} />
        </Button>
        <Button variant="ghost" size="sm" onClick={onOpenInfo}>
          <MoreVertical size={20} />
        </Button>
      </div>
    </div>
  );
}