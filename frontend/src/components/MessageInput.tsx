'use client';

 

import React, { useState, useRef } from 'react';

import Button from '../components/Button';

import {

  PaperAirplaneIcon,

  PaperClipIcon,

  GifIcon,

} from '@heroicons/react/24/outline';

 

interface MessageInputProps {

  onSendMessage: (content: string, type: 'text' | 'file' | 'gif', fileData?: any) => void;

  disabled?: boolean;

}

 

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, disabled }) => {

  const [message, setMessage] = useState('');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

 

  const handleSubmit = (e: React.FormEvent) => {

    e.preventDefault();

 

    if (!message.trim() && !selectedFile) {

      return;

    }

 

    if (selectedFile) {

      // Slanje datoteke

      onSendMessage(message || 'Datoteka', 'file', selectedFile);

      setSelectedFile(null);

    } else {

      // Slanje tekstualne poruke

      onSendMessage(message, 'text');

    }

 

    setMessage('');

  };

 

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {

    const file = e.target.files?.[0];

    if (file) {

      // Provera veličine datoteke (max 10MB)

      if (file.size > 10 * 1024 * 1024) {

        alert('Datoteka je prevelika. Maksimalna veličina je 10MB.');

        return;

      }

      setSelectedFile(file);

    }

  };

 

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {

    // Slanje poruke sa Enter (Shift+Enter za novi red)

    if (e.key === 'Enter' && !e.shiftKey) {

      e.preventDefault();

      handleSubmit(e as any);

    }

  };

 

  return (

    <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4 bg-white">

      {/* Prikaz izabrane datoteke */}

      {selectedFile && (

        <div className="mb-2 flex items-center justify-between bg-gray-100 p-2 rounded">

          <span className="text-sm text-gray-700 truncate">{selectedFile.name}</span>

          <button

            type="button"

            onClick={() => setSelectedFile(null)}

            className="text-red-600 hover:text-red-700 text-sm"

          >

            Ukloni

          </button>

        </div>

      )}

 

      <div className="flex items-end space-x-2">

        {/* Dugme za dodavanje datoteke */}

        <button

          type="button"

          onClick={() => fileInputRef.current?.click()}

          className="p-2 text-gray-600 hover:text-blue-600 transition-colors"

          title="Priloži datoteku"

          disabled={disabled}

        >

          <PaperClipIcon className="h-6 w-6" />

        </button>

 

        <input

          ref={fileInputRef}

          type="file"

          onChange={handleFileSelect}

          className="hidden"

          accept="*/*"

        />

 

        {/* Polje za unos teksta */}

        <textarea

          value={message}

          onChange={(e) => setMessage(e.target.value)}

          onKeyPress={handleKeyPress}

          placeholder="Unesite poruku..."

          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"

          rows={1}

          disabled={disabled}

        />

 

        {/* Dugme za slanje */}

        <Button

          type="submit"

          disabled={disabled || (!message.trim() && !selectedFile)}

          className="px-4 py-2"

        >

          <PaperAirplaneIcon className="h-5 w-5" />

        </Button>

      </div>

 

      {/* Informacija o prečicama */}

      <div className="mt-2 text-xs text-gray-500">

        Pritisnite Enter za slanje, Shift+Enter za novi red

      </div>

    </form>

  );

};

 

export default MessageInput;