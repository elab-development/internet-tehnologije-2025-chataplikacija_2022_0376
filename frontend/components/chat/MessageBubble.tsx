'use client';

import React, { useState } from 'react';
import { Message } from '../../types/types';
import { MoreVertical, Edit, Trash2, Flag, Download, FileText, CheckCheck } from 'lucide-react';
import { formatMessageTime } from '../../lib/utils';
import Avatar from '../../components/ui/Avatar';
import { cn } from '../../lib/utils';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
  onEdit?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
  onReport?: (messageId: string) => void;
}

export default function MessageBubble({
  message,
  isOwn,
  showAvatar = true,
  onEdit,
  onDelete,
  onReport,
}: MessageBubbleProps) {
  const [showMenu, setShowMenu] = useState(false);

  const renderFileContent = () => {
    const { type, fileUrl, fileName, fileSize, mimeType, content } = message;

    // Tekst poruka
    if (type === 'text' || !fileUrl) {
      return (
        <p className="text-sm break-words whitespace-pre-wrap">
          {content}
        </p>
      );
    }

    // GIF
    if (type === 'gif' || mimeType === 'image/gif') {
      return (
        <div className="space-y-1">
          <img
            src={fileUrl}
            alt="GIF"
            className="rounded-lg max-w-[280px] w-full"
          />
          {content && content !== `📎 ${fileName}` && (
            <p className="text-sm mt-2">{content}</p>
          )}
        </div>
      );
    }

    // Slike
    if (type === 'image' || mimeType?.startsWith('image/')) {
      return (
        <div className="space-y-1">
          <img
            src={fileUrl}
            alt={fileName || 'Image'}
            className="rounded-lg max-w-[320px] w-full cursor-pointer hover:opacity-90 transition"
            onClick={() => window.open(fileUrl, '_blank')}
          />
          {content && content !== `📎 ${fileName}` && (
            <p className="text-sm mt-2">{content}</p>
          )}
        </div>
      );
    }

    // Video
    if (type === 'video' || mimeType?.startsWith('video/')) {
      return (
        <div className="space-y-1">
          <video
            src={fileUrl}
            controls
            className="rounded-lg max-w-[320px] w-full"
          >
            Vaš browser ne podržava video.
          </video>
          {content && content !== `📎 ${fileName}` && (
            <p className="text-sm mt-2">{content}</p>
          )}
        </div>
      );
    }

    // Fajlovi (PDF, DOC, itd.)
    if (type === 'file') {
      const getFileIcon = () => {
        if (mimeType?.includes('pdf')) return <FileText className="text-red-500" size={24} />;
        if (mimeType?.includes('document') || mimeType?.includes('word')) 
          return <FileText className="text-blue-500" size={24} />;
        return <FileText className="text-gray-500" size={24} />;
      };

      return (
        <div className="space-y-1">
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`
              flex items-center gap-3 p-3 rounded-lg border transition
              ${isOwn ? 'bg-white/20 border-blue-300 hover:bg-white/30' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}
            `}
          >
            <div className="flex-shrink-0">
              {getFileIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${isOwn ? 'text-white' : 'text-gray-800'}`}>
                {fileName || 'Document'}
              </p>
              {fileSize && (
                <p className={`text-xs ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                  {fileSize}
                </p>
              )}
            </div>
            <Download size={18} className={isOwn ? 'text-blue-100' : 'text-gray-400'} />
          </a>
          {content && content !== `📎 ${fileName}` && (
            <p className="text-sm mt-2">{content}</p>
          )}
        </div>
      );
    }

    return <p className="text-sm">{content}</p>;
  };

  return (
    <div className={cn('flex gap-2 mb-1 group', isOwn ? 'justify-end' : 'justify-start')}>
      {/* Avatar za druge korisnike */}
      {!isOwn && showAvatar && (
        <Avatar
          src={message.sender?.avatar}
          firstName={message.sender?.firstName}
          lastName={message.sender?.lastName}
          size="sm"
          className="flex-shrink-0"
        />
      )}
      {!isOwn && !showAvatar && <div className="w-8" />}

      <div className={cn('flex flex-col max-w-[75%]', isOwn && 'items-end')}>
        {/* Ime pošiljaoca */}
        {!isOwn && showAvatar && (
          <span className="text-[10px] text-gray-500 mb-1 ml-1">
            {message.sender?.firstName} {message.sender?.lastName}
          </span>
        )}

        <div className="relative flex items-center gap-2">
          {/* Menu dugme LEVO za svoje poruke */}
          {isOwn && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity order-1">
              <button 
                onClick={() => setShowMenu(!showMenu)} 
                className="p-1 hover:bg-gray-200 rounded-full"
              >
                <MoreVertical size={14} className="text-gray-400" />
              </button>
            </div>
          )}

          {/* Message Bubble */}
          <div
            className={cn(
              'rounded-2xl px-3 py-2 shadow-sm relative order-2',
              isOwn
                ? 'bg-blue-600 text-white rounded-tr-none'
                : 'bg-white text-gray-800 rounded-tl-none border border-gray-200'
            )}
          >
            {/* Fajl/Text Content */}
            {renderFileContent()}

            {/* Timestamp & Status */}
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

            {/* Dropdown Menu */}
            {showMenu && (
              <div className={cn(
                "absolute top-full mt-1 w-32 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-20",
                isOwn ? "right-0" : "left-0"
              )}>
                {isOwn ? (
                  <>
                    {message.type === 'text' && onEdit && (
                      <button 
                        onClick={() => { 
                          onEdit(message.id); 
                          setShowMenu(false); 
                        }} 
                        className="w-full px-3 py-1.5 text-xs text-left hover:bg-gray-100 flex items-center gap-2 text-gray-700"
                      >
                        <Edit size={12} /> Izmeni
                      </button>
                    )}
                    {onDelete && (
                      <button 
                        onClick={() => { 
                          onDelete(message.id); 
                          setShowMenu(false); 
                        }} 
                        className="w-full px-3 py-1.5 text-xs text-left hover:bg-gray-100 flex items-center gap-2 text-red-600"
                      >
                        <Trash2 size={12} /> Obriši
                      </button>
                    )}
                  </>
                ) : (
                  onReport && (
                    <button 
                      onClick={() => { 
                        onReport(message.id); 
                        setShowMenu(false); 
                      }} 
                      className="w-full px-3 py-1.5 text-xs text-left hover:bg-gray-100 flex items-center gap-2 text-red-600"
                    >
                      <Flag size={12} /> Prijavi
                    </button>
                  )
                )}
              </div>
            )}
          </div>

          {/* Menu dugme DESNO za tuđe poruke */}
          {!isOwn && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity order-3">
              <button 
                onClick={() => setShowMenu(!showMenu)} 
                className="p-1 hover:bg-gray-200 rounded-full"
              >
                <MoreVertical size={14} className="text-gray-400" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}