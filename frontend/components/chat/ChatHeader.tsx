'use client';

import React from 'react';
import { Phone, Video, MoreVertical, ArrowLeft, Users } from 'lucide-react';
import { Conversation, User } from '../../types/types';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';

interface ChatHeaderProps {
  conversation: Conversation;
  currentUser: User;
  onBack?: () => void;
  onOpenInfo: () => void;
}

// Pomoćna funkcija za klase
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

export default function ChatHeader({
  conversation,
  currentUser,
  onBack,
  onOpenInfo,
}: ChatHeaderProps) {
  const isGroup = conversation.type === 'group';
  
  // Sagovornik je onaj koji nije trenutni korisnik
  const otherParticipant = conversation.participants.find(p => p.id !== currentUser.id);
  
  const displayName = isGroup
    ? conversation.name
    : otherParticipant
    ? `${otherParticipant.firstName} ${otherParticipant.lastName}`
    : 'Korisnik';

  return (
    <div className="h-[70px] bg-white border-b border-gray-200 flex items-center justify-between px-4 z-10">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack} className="lg:hidden p-1 -ml-2">
            <ArrowLeft size={22} className="text-gray-600" />
          </Button>
        )}

        <div className="flex items-center gap-3 cursor-pointer" onClick={onOpenInfo}>
          {isGroup ? (
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
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

          <div className="flex flex-col min-w-0">
            <h2 className="font-bold text-gray-900 text-sm truncate leading-tight">
              {displayName}
            </h2>
            <p className={cn(
              "text-[11px] font-medium",
              !isGroup && otherParticipant?.isOnline ? "text-green-500" : "text-gray-400"
            )}>
              {isGroup 
                ? `${conversation.participants.length} učesnika` 
                : otherParticipant?.isOnline ? 'Aktivan/na na mreži' : 'Van mreže'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" className="text-blue-600 hover:bg-blue-50 rounded-full w-10 h-10 p-0">
          <Video size={20} />
        </Button>
        <Button variant="ghost" className="text-blue-600 hover:bg-blue-50 rounded-full w-10 h-10 p-0">
          <Phone size={20} />
        </Button>
        <div className="w-[1px] h-6 bg-gray-200 mx-1" />
        <Button variant="ghost" onClick={onOpenInfo} className="text-gray-400 hover:bg-gray-100 rounded-full w-10 h-10 p-0">
          <MoreVertical size={20} />
        </Button>
      </div>
    </div>
  );
}