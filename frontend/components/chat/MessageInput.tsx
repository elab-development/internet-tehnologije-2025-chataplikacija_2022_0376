'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import Button from '../../components/ui/Button';
import GifPicker from './GifPicker';
import axios from '../../lib/axios';
import toast from 'react-hot-toast';
import { cn } from '../../lib/utils';

interface MessageInputProps {
  onSendMessage: (
    content: string, 
    fileData?: {
      fileUrl: string;
      fileName: string;
      fileSize: string;
      mimeType: string;
      messageType: string;
    }
  ) => void;
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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [filePreview, setFilePreview] = useState<{
    name: string;
    type: string;
    url?: string;
  } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const gifPickerRef = useRef<HTMLDivElement>(null);

  // Zatvori pickere ako klikneš van njih
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
      if (gifPickerRef.current && !gifPickerRef.current.contains(event.target as Node)) {
        setShowGifPicker(false);
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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validacija veličine (max 50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('Fajl je prevelik! Maksimalna veličina je 50MB.');
      return;
    }

    console.log('📂 Selected file:', {
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      type: file.type,
    });

    // Preview za slike
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview({
          name: file.name,
          type: file.type,
          url: e.target?.result as string,
        });
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview({
        name: file.name,
        type: file.type,
      });
    }

    // Upload fajla
    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(progress);
          }
        },
      });

      console.log('✅ File uploaded:', response.data);

      // Pošalji poruku sa fajlom
      onSendMessage(message || `📎 ${file.name}`, {
        fileUrl: response.data.fileUrl,
        fileName: response.data.fileName,
        fileSize: response.data.fileSize,
        mimeType: response.data.mimeType,
        messageType: response.data.messageType,
      });

      // Reset
      setMessage('');
      setFilePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      toast.success('Fajl poslat!');
    } catch (error: any) {
      console.error('❌ Upload error:', error);
      toast.error(error.response?.data?.message || 'Greška pri slanju fajla');
      setFilePreview(null);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleGifSelect = (gifUrl: string) => {
    console.log('🎬 GIF selected:', gifUrl);
    
    onSendMessage('', {
      fileUrl: gifUrl,
      fileName: 'giphy.gif',
      fileSize: 'N/A',
      mimeType: 'image/gif',
      messageType: 'gif',
    });

    setShowGifPicker(false);
    toast.success('GIF poslat!');
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!message.trim() && !filePreview) return;

    onSendMessage(message.trim());
    
    setMessage('');
    setFilePreview(null);
    setShowEmojiPicker(false);
    setShowGifPicker(false);
    
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
      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div ref={emojiPickerRef} className="absolute bottom-20 right-4 z-50 shadow-2xl">
          <EmojiPicker 
            onEmojiClick={onEmojiClick} 
            theme={Theme.LIGHT}
            autoFocusSearch={false}
          />
        </div>
      )}

      {/* GIF Picker */}
      {showGifPicker && (
        <div ref={gifPickerRef} className="absolute bottom-20 right-4 z-50 bg-white rounded-lg shadow-2xl border">
          <GifPicker onGifSelect={handleGifSelect} />
        </div>
      )}

      {/* Edit Mode Indicator */}
      {editingMessage && (
        <div className="mb-2 flex items-center justify-between bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
          <span className="text-sm text-blue-700 flex items-center gap-2">
            <span className="font-semibold">Izmena poruke:</span> 
            {editingMessage.content.substring(0, 50)}...
          </span>
          <button onClick={onCancelEdit} className="text-blue-700 hover:text-blue-900">
            <X size={16} />
          </button>
        </div>
      )}

      {/* File Preview */}
      {filePreview && (
        <div className="mb-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {filePreview.url ? (
                <img 
                  src={filePreview.url} 
                  alt="Preview" 
                  className="w-12 h-12 rounded object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded bg-blue-100 flex items-center justify-center text-2xl">
                  📎
                </div>
              )}
              <div>
                <p className="text-sm font-medium truncate max-w-[200px]">
                  {filePreview.name}
                </p>
                {uploading && (
                  <div className="mt-1">
                    <div className="w-32 h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{uploadProgress}%</p>
                  </div>
                )}
              </div>
            </div>
            {!uploading && (
              <button 
                onClick={() => {
                  setFilePreview(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }} 
                className="text-gray-500 hover:text-red-500"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end gap-2 max-w-7xl mx-auto">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,video/*,.pdf,.doc,.docx,.gif"
        />
        
        {/* File Upload Button */}
        <Button
          type="button"
          variant="ghost"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading}
          className="flex-shrink-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
          title="Priloži fajl"
        >
          {uploading ? (
            <Loader2 size={22} className="animate-spin" />
          ) : (
            <Paperclip size={22} />
          )}
        </Button>

        {/* GIF Button */}
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setShowGifPicker(!showGifPicker);
            setShowEmojiPicker(false);
          }}
          disabled={disabled}
          className={cn(
            "flex-shrink-0 hover:bg-blue-50",
            showGifPicker ? "text-blue-600" : "text-gray-500 hover:text-blue-600"
          )}
          title="Izaberi GIF"
        >
          <ImageIcon size={22} />
        </Button>

        {/* Text Input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyPress}
            placeholder="Napišite poruku..."
            disabled={disabled || uploading}
            rows={1}
            className={cn(
              'w-full px-4 py-3 pr-12 rounded-2xl border border-gray-200 bg-gray-50',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all',
              'placeholder:text-gray-400 text-gray-900 resize-none min-h-[46px]',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          />
          
          {/* Emoji Button */}
          <button
            type="button"
            onClick={() => {
              setShowEmojiPicker(!showEmojiPicker);
              setShowGifPicker(false);
            }}
            className={cn(
              "absolute right-3 bottom-3 transition-colors",
              showEmojiPicker ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
            )}
          >
            <Smile size={22} />
          </button>
        </div>

        {/* Send Button */}
        <Button
          type="submit"
          variant="primary"
          disabled={disabled || uploading || (!message.trim() && !filePreview)}
          className="flex-shrink-0 w-11 h-11 p-0 rounded-full shadow-md hover:shadow-lg transition-all"
        >
          <Send size={20} className="ml-0.5" />
        </Button>
      </form>
    </div>
  );
}