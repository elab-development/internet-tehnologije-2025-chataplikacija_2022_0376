'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MoreVertical, Search, Phone, Video } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { Avatar } from '@/components/ui/Avatar';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/hooks/useAuth';

export const ChatWindow: React.FC = () => {
  const { selectedConversation, messages, sendMessage, editMessage, deleteMessage, loadMoreMessages } = useChat();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]); // placeholder, future typing indicator

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle scroll to load older messages
  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (container && container.scrollTop === 0) {
      loadMoreMessages();
    }
  };

  // Handle typing indicator (placeholder for now, without sockets)
  const handleTyping = (isTyping: boolean) => {
    // Can later emit typing events via socket when implemented
  };

  // If no conversation selected
  if (!selectedConversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
            <Search className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Select a conversation</h3>
          <p className="text-gray-500">Choose a conversation from the list to start chatting</p>
        </div>
      </div>
    );
  }

  // Helpers
  const getConversationName = () => {
    if (selectedConversation.type === 'group') return selectedConversation.name || 'Group Chat';
    const otherParticipant = selectedConversation.participants.find(p => p.userId !== user?.id);
    return otherParticipant?.user.username || 'Chat';
  };

  const getConversationAvatar = () => {
    if (selectedConversation.type === 'group') return selectedConversation.avatarUrl;
    const otherParticipant = selectedConversation.participants.find(p => p.userId !== user?.id);
    return otherParticipant?.user.avatarUrl;
  };

  const isOnline = () => {
    if (selectedConversation.type === 'group') return false;
    const otherParticipant = selectedConversation.participants.find(p => p.userId !== user?.id);
    return otherParticipant?.user.isOnline || false;
  };

  return (
    <div className="flex-1 flex flex-col h-screen">
      {/* Header */}
      <div className="h-16 border-b border-gray-200 bg-white px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar
            src={getConversationAvatar()}
            fallbackText={getConversationName()}
            size="md"
            status={isOnline() ? 'online' : 'offline'}
            showStatus={selectedConversation.type === 'private'}
          />
          <div>
            <h2 className="font-semibold text-gray-900">{getConversationName()}</h2>
            <p className="text-sm text-gray-500">
              {selectedConversation.type === 'group'
                ? `${selectedConversation.participants.length} members`
                : isOnline()
                ? 'Online'
                : 'Offline'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Phone className="h-5 w-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Video className="h-5 w-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Search className="h-5 w-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <MoreVertical className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto bg-gray-50 px-6 py-4 space-y-4"
      >
        {messages.map(message => (
          <MessageBubble
            key={message.id}
            message={message}
            onEdit={editMessage}
            onDelete={deleteMessage}
          />
        ))}

        {/* Typing indicator (local, future socket support) */}
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span>{typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <MessageInput onSend={sendMessage} onTyping={handleTyping} />
    </div>
  );
};
