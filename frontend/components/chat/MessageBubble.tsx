'use client';

import React, { useState } from 'react';
import { Check, CheckCheck, MoreVertical, Pencil, Trash2, AlertCircle } from 'lucide-react';
import { Message, User } from '../../types/types';
import Avatar from '../../components/ui/Avatar';
import { formatMessageTime } from '../../lib/utils';
import { cn } from '../../lib/utils';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
  onEdit?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
  onReport?: (messageId: string) => void;
}

export default function MessageBubble({
  message,
  isOwn,
  showAvatar,
  onEdit,
  onDelete,
  onReport,
}: MessageBubbleProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      className={cn(
        'flex gap-2 mb-1 group',
        isOwn ? 'justify-end' : 'justify-start'
      )}
    >
      {/* Avatar for other users */}
      {!isOwn && showAvatar && (
        <Avatar
          src={message.sender.avatar}
          firstName={message.sender.firstName}
          lastName={message.sender.lastName}
          size="sm"
          className="flex-shrink-0"
        />
      )}
      {!isOwn && !showAvatar && <div className="w-8" />}

      {/* Message Container */}
      <div className={cn('flex flex-col max-w-[70%]', isOwn && 'items-end')}>
        {/* Sender name (for group chats, if not own) */}
        {!isOwn && showAvatar && (
          <span className="text-xs text-dark-600 mb-1 ml-2">
            {message.sender.firstName} {message.sender.lastName}
          </span>
        )}

        <div className="relative">
          {/* Message Bubble */}
          <div
            className={cn(
              'rounded-lg px-4 py-2 shadow-sm relative',
              isOwn
                ? 'bg-primary-600 text-white rounded-br-none'
                : 'bg-white text-dark-900 rounded-bl-none border border-dark-200'
            )}
          >
            {/* File/Image Preview */}
            {message.type === 'image' && message.fileUrl && (
              <img
                src={message.fileUrl}
                alt="Shared image"
                className="rounded-lg mb-2 max-w-full h-auto"
              />
            )}

            {message.type === 'file' && message.fileUrl && (
              <a
                href={message.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'flex items-center gap-2 mb-2 p-2 rounded',
                  isOwn ? 'bg-primary-700' : 'bg-dark-50'
                )}
              >
                <div className="w-10 h-10 rounded bg-primary-100 flex items-center justify-center">
                  📄
                </div>
                <span className="text-sm truncate">File attachment</span>
              </a>
            )}

            {/* Message Content */}
            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>

            {/* Edited Indicator */}
            {message.isEdited && (
              <span className={cn('text-xs italic ml-1', isOwn ? 'text-primary-200' : 'text-dark-500')}>
                (izmenjeno)
              </span>
            )}

            {/* Time and Status */}
            <div className="flex items-center justify-end gap-1 mt-1">
              <span className={cn('text-xs', isOwn ? 'text-primary-200' : 'text-dark-500')}>
                {formatMessageTime(message.createdAt)}
              </span>
              {isOwn && (
                <CheckCheck size={14} className="text-primary-200" />
              )}
            </div>
          </div>

          {/* Message Menu */}
          <div
            className={cn(
              'absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity',
              isOwn ? '-left-8' : '-right-8'
            )}
          >
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded-full hover:bg-dark-100 transition-colors"
            >
              <MoreVertical size={16} className="text-dark-600" />
            </button>

            {showMenu && (
              <div
                className={cn(
                  'absolute top-0 mt-6 w-40 bg-white rounded-lg shadow-lg border border-dark-200 py-1 z-10',
                  isOwn ? 'right-0' : 'left-0'
                )}
              >
                {isOwn && onEdit && (
                  <button
                    onClick={() => {
                      onEdit(message.id);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-sm text-left hover:bg-dark-50 flex items-center gap-2"
                  >
                    <Pencil size={14} />
                    Izmeni
                  </button>
                )}
                {isOwn && onDelete && (
                  <button
                    onClick={() => {
                      onDelete(message.id);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-sm text-left hover:bg-dark-50 flex items-center gap-2 text-red-600"
                  >
                    <Trash2 size={14} />
                    Obriši
                  </button>
                )}
                {!isOwn && onReport && (
                  <button
                    onClick={() => {
                      onReport(message.id);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-sm text-left hover:bg-dark-50 flex items-center gap-2 text-red-600"
                  >
                    <AlertCircle size={14} />
                    Prijavi
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}