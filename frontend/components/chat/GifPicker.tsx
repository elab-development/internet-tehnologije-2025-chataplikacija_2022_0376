'use client';

import React, { useState } from 'react';
import { Grid } from '@giphy/react-components';
import { GiphyFetch } from '@giphy/js-fetch-api';
import { Search, X } from 'lucide-react';

interface GifPickerProps {
  onGifSelect: (gifUrl: string) => void;
}

// ✅ Koristi environment variable
const GIPHY_API_KEY = process.env.NEXT_PUBLIC_GIPHY_API_KEY || '';

if (!GIPHY_API_KEY) {
  console.error('❌ GIPHY_API_KEY is not set! Add NEXT_PUBLIC_GIPHY_API_KEY to .env.local');
}

const gf = new GiphyFetch(GIPHY_API_KEY);

export default function GifPicker({ onGifSelect }: GifPickerProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const fetchGifs = (offset: number) => {
    if (searchTerm.trim()) {
      return gf.search(searchTerm, { offset, limit: 10 });
    }
    return gf.trending({ offset, limit: 10 });
  };

  if (!GIPHY_API_KEY) {
    return (
      <div className="w-[400px] p-6 text-center">
        <p className="text-red-600 text-sm">
          ⚠️ Giphy API key nije konfigurisan!
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Dodaj NEXT_PUBLIC_GIPHY_API_KEY u .env.local
        </p>
      </div>
    );
  }

  return (
    <div className="w-[400px] h-[500px] flex flex-col">
      {/* Header */}
      <div className="p-3 border-b bg-gray-50">
        <h3 className="font-semibold text-gray-700 mb-2 flex items-center justify-between">
          <span>Izaberi GIF</span>
          <span className="text-xs text-gray-400">Powered by GIPHY</span>
        </h3>
        
        {/* Search */}
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pretraži GIF-ove..."
            className="w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* GIF Grid */}
      <div className="flex-1 overflow-y-auto p-2">
        <Grid
          key={searchTerm}
          width={380}
          columns={2}
          gutter={6}
          fetchGifs={fetchGifs}
          onGifClick={(gif, e) => {
            e.preventDefault();
            const gifUrl = gif.images.original.url || gif.images.downsized_medium.url;
            onGifSelect(gifUrl);
          }}
          noLink={true}
        />
      </div>

      {/* Footer */}
      <div className="p-2 border-t text-center">
        <p className="text-xs text-gray-400">
          Klikni na GIF da ga pošalješ
        </p>
      </div>
    </div>
  );
}