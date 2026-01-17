'use client';

import React, { useState } from 'react';
import { CheckCheck, MoreVertical, Pencil, Trash2, AlertCircle } from 'lucide-react';
import { Message } from '../../types/types';
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
    <div className={cn('flex gap-2 mb-1 group', isOwn ? 'justify-end' : 'justify-start')}>
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

      <div className={cn('flex flex-col max-w-[75%]', isOwn && 'items-end')}>
        {!isOwn && showAvatar && (
          <span className="text-[10px] text-gray-500 mb-1 ml-1">
            {message.sender.firstName} {message.sender.lastName}
          </span>
        )}

        <div className="relative flex items-center gap-2">
          {/* Menu Button - Left for Own, Right for Others */}
          {isOwn && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity order-1">
               <button onClick={() => setShowMenu(!showMenu)} className="p-1 hover:bg-gray-200 rounded-full">
                <MoreVertical size={14} className="text-gray-400" />
              </button>
            </div>
          )}

          <div
            className={cn(
              'rounded-2xl px-3 py-2 shadow-sm relative order-2',
              isOwn
                ? 'bg-blue-600 text-white rounded-tr-none' // Tamno plava za tebe, beli tekst
                : 'bg-white text-gray-800 rounded-tl-none border border-gray-200' // Bela za druge
            )}
          >
            {message.type === 'image' && message.fileUrl && (
              <img src={message.fileUrl} alt="Shared" className="rounded-lg mb-2 max-w-full h-auto" />
            )}

            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>

            <div className="flex items-center justify-end gap-1 mt-1">
              {message.isEdited && (
                <span className={cn('text-[10px] italic', isOwn ? 'text-blue-200' : 'text-gray-400')}>
                  (izmenjeno)
                </span>
              )}
              <span className={cn('text-[10px]', isOwn ? 'text-blue-100' : 'text-gray-400')}>
                {formatMessageTime(message.createdAt)}
              </span>
              {isOwn && <CheckCheck size={12} className="text-blue-100" />}
            </div>
            
            {/* Pop-up Menu */}
            {showMenu && (
              <div className={cn(
                "absolute top-full mt-1 w-32 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-20",
                isOwn ? "right-0" : "left-0"
              )}>
                {isOwn ? (
                  <>
                    <button onClick={() => { onEdit?.(message.id); setShowMenu(false); }} className="w-full px-3 py-1.5 text-xs text-left hover:bg-gray-100 flex items-center gap-2">
                      <Pencil size={12} /> Izmeni
                    </button>
                    <button onClick={() => { onDelete?.(message.id); setShowMenu(false); }} className="w-full px-3 py-1.5 text-xs text-left hover:bg-gray-100 flex items-center gap-2 text-red-600">
                      <Trash2 size={12} /> Obriši
                    </button>
                  </>
                ) : (
                  <button onClick={() => { onReport?.(message.id); setShowMenu(false); }} className="w-full px-3 py-1.5 text-xs text-left hover:bg-gray-100 flex items-center gap-2 text-red-600">
                    <AlertCircle size={12} /> Prijavi
                  </button>
                )}
              </div>
            )}
          </div>

          {!isOwn && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity order-3">
               <button onClick={() => setShowMenu(!showMenu)} className="p-1 hover:bg-gray-200 rounded-full">
                <MoreVertical size={14} className="text-gray-400" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}