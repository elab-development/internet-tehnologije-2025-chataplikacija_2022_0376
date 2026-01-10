'use client';

import React, { useState, useRef } from 'react';
import { Send, Paperclip, Smile, X } from 'lucide-react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Set message when editing
  React.useEffect(() => {
    if (editingMessage) {
      setMessage(editingMessage.content);
      textareaRef.current?.focus();
    }
  }, [editingMessage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() && !selectedFile) return;

    onSendMessage(message, selectedFile || undefined);
    setMessage('');
    setSelectedFile(null);
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  return (
    <div className="border-t border-dark-200 bg-white p-4">
      {/* Editing Indicator */}
      {editingMessage && (
        <div className="mb-2 flex items-center justify-between bg-primary-50 px-3 py-2 rounded-lg">
          <span className="text-sm text-primary-700">
            Izmena poruke
          </span>
          <button
            onClick={onCancelEdit}
            className="text-primary-700 hover:text-primary-800"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Selected File */}
      {selectedFile && (
        <div className="mb-2 flex items-center justify-between bg-dark-50 px-3 py-2 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-primary-100 flex items-center justify-center">
              📎
            </div>
            <span className="text-sm text-dark-700 truncate max-w-[200px]">
              {selectedFile.name}
            </span>
          </div>
          <button
            onClick={() => setSelectedFile(null)}
            className="text-dark-600 hover:text-dark-800"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        {/* File Upload */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.txt"
        />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="flex-shrink-0"
        >
          <Paperclip size={20} />
        </Button>

        {/* Text Input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyPress={handleKeyPress}
            placeholder="Napišite poruku..."
            disabled={disabled}
            rows={1}
            className={cn(
              'w-full px-4 py-2.5 pr-12 rounded-lg border border-dark-300 bg-white',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
              'placeholder:text-dark-400 text-dark-900 resize-none',
              'disabled:bg-dark-100 disabled:cursor-not-allowed'
            )}
          />
          
          {/* Emoji Button */}
          <button
            type="button"
            className="absolute right-3 bottom-3 text-dark-400 hover:text-dark-600"
          >
            <Smile size={20} />
          </button>
        </div>

        {/* Send Button */}
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={disabled || (!message.trim() && !selectedFile)}
          className="flex-shrink-0 w-10 h-10 p-0 rounded-full"
        >
          <Send size={18} />
        </Button>
      </form>
    </div>
  );
}