'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile, X } from 'lucide-react';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import Button from '../../components/ui/Button';
import { cn } from '../../lib/utils';

interface MessageInputProps {
  onSendMessage: (content: string, file?: File) => void;
  editingMessage?: { id: string; content: string } | null;
  onCancelEdit?: () => void;
  disabled?: boolean;
}

export default function MessageInput({
  onSendMessage,
  editingMessage,
  onCancelEdit,
  disabled = false,
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Zatvori emoji picker ako klikneš van njega
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (editingMessage) {
      setMessage(editingMessage.content);
      textareaRef.current?.focus();
    }
  }, [editingMessage]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!message.trim() && !selectedFile) return;

    // Slanje podataka roditeljskoj komponenti (ChatWindow)
    onSendMessage(message.trim(), selectedFile || undefined);
    
    // Resetovanje inputa
    setMessage('');
    setSelectedFile(null);
    setShowEmojiPicker(false);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const onEmojiClick = (emojiData: any) => {
    setMessage((prev) => prev + emojiData.emoji);
    textareaRef.current?.focus();
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4 relative">
      {/* Emoji Picker Popup */}
      {showEmojiPicker && (
        <div ref={pickerRef} className="absolute bottom-20 right-4 z-50 shadow-2xl">
          <EmojiPicker 
            onEmojiClick={onEmojiClick} 
            theme={Theme.LIGHT}
            autoFocusSearch={false}
          />
        </div>
      )}

      {/* Edit Mode Indicator */}
      {editingMessage && (
        <div className="mb-2 flex items-center justify-between bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
          <span className="text-sm text-blue-700 flex items-center gap-2">
            <span className="font-semibold">Izmena poruke:</span> {editingMessage.content.substring(0, 50)}...
          </span>
          <button onClick={onCancelEdit} className="text-blue-700 hover:text-blue-900">
            <X size={16} />
          </button>
        </div>
      )}

      {/* File Preview */}
      {selectedFile && (
        <div className="mb-2 flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center text-lg">
              📎
            </div>
            <span className="text-sm text-gray-700 truncate max-w-[200px]">
              {selectedFile.name}
            </span>
          </div>
          <button onClick={() => setSelectedFile(null)} className="text-gray-500 hover:text-red-500">
            <X size={18} />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end gap-2 max-w-7xl mx-auto">
        <input
          ref={fileInputRef}
          type="file"
          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.txt"
        />
        
        <Button
          type="button"
          variant="ghost"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="flex-shrink-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
        >
          <Paperclip size={22} />
        </Button>

        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyPress}
            placeholder="Napišite poruku..."
            disabled={disabled}
            rows={1}
            className={cn(
              'w-full px-4 py-3 pr-12 rounded-2xl border border-gray-200 bg-gray-50',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all',
              'placeholder:text-gray-400 text-gray-900 resize-none min-h-[46px]',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          />
          
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={cn(
              "absolute right-3 bottom-3 transition-colors",
              showEmojiPicker ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
            )}
          >
            <Smile size={22} />
          </button>
        </div>

        <Button
          type="submit"
          variant="primary"
          disabled={disabled || (!message.trim() && !selectedFile)}
          className="flex-shrink-0 w-11 h-11 p-0 rounded-full shadow-md hover:shadow-lg transition-all"
        >
          <Send size={20} className="ml-0.5" />
        </Button>
      </form>
    </div>
  );
}