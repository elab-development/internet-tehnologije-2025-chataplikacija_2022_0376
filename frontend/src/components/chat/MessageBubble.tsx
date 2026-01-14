'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { MoreVertical, Edit, Trash2, Flag } from 'lucide-react';
import { Message } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/context/AuthContext';
import clsx from 'clsx';

interface MessageBubbleProps {
  message: Message;
  onEdit?: (messageId: string, content: string) => void;
  onDelete?: (messageId: string) => void;
  onReport?: (messageId: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onEdit,
  onDelete,
  onReport,
}) => {
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const isOwnMessage = user?.id === message.senderId;

  const handleEdit = () => {
    if (onEdit && editContent.trim() !== message.content) {
      onEdit(message.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (onDelete && confirm('Are you sure you want to delete this message?')) {
      onDelete(message.id);
    }
    setShowMenu(false);
  };

  const handleReport = () => {
    if (onReport) {
      onReport(message.id);
    }
    setShowMenu(false);
  };

  if (message.isDeleted) {
    return (
      <div className="flex items-center justify-center py-2">
        <span className="text-sm text-gray-400 italic">{message.content}</span>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        'flex gap-3 group',
        isOwnMessage ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {!isOwnMessage && (
        <Avatar
          src={message.sender.avatarUrl}
          fallbackText={message.sender.username}
          size="sm"
          status={message.sender.isOnline ? 'online' : 'offline'}
          showStatus
        />
      )}

      <div
        className={clsx(
          'flex flex-col max-w-[70%]',
          isOwnMessage ? 'items-end' : 'items-start'
        )}
      >
        {!isOwnMessage && (
          <span className="text-xs font-medium text-gray-700 mb-1">
            {message.sender.username}
          </span>
        )}

        <div className="relative">
          {isEditing ? (
            <div className="flex flex-col gap-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[200px]"
                rows={3}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleEdit}
                  className="px-3 py-1 bg-primary-600 text-white rounded text-sm hover:bg-primary-700"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(message.content);
                  }}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div
                className={clsx(
                  'px-4 py-2 rounded-lg break-words',
                  isOwnMessage
                    ? 'bg-primary-600 text-white rounded-br-none'
                    : 'bg-gray-100 text-gray-900 rounded-bl-none'
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>

              <button
                onClick={() => setShowMenu(!showMenu)}
                className={clsx(
                  'absolute top-1 p-1 rounded hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity',
                  isOwnMessage ? 'left-[-30px]' : 'right-[-30px]'
                )}
              >
                <MoreVertical className="h-4 w-4 text-gray-600" />
              </button>

              {showMenu && (
                <div
                  className={clsx(
                    'absolute top-8 z-10 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[150px]',
                    isOwnMessage ? 'left-[-160px]' : 'right-[-160px]'
                  )}
                >
                  {isOwnMessage && (
                    <>
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setShowMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        onClick={handleDelete}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </>
                  )}
                  {!isOwnMessage && (
                    <button
                      onClick={handleReport}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                    >
                      <Flag className="h-4 w-4" />
                      Report
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-500">
            {format(new Date(message.createdAt), 'HH:mm')}
          </span>
          {message.isEdited && (
            <span className="text-xs text-gray-400 italic">(edited)</span>
          )}
        </div>
      </div>
    </div>
  );
};