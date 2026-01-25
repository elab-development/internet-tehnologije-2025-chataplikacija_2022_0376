'use client';

import React from 'react';
import { Heart, Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-dark-200 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left Section */}
          <div className="flex items-center gap-2 text-sm text-dark-600">
            <span>Napravljeno sa</span>
            <Heart size={16} className="text-red-500 fill-current" />
            <span>od</span>
            <span className="font-semibold text-dark-900">
              Jovana Grujić, Ana Dobrijević, Milica Gojković
            </span>
          </div>

          {/* Center Section */}
          <div className="text-sm text-dark-500">
            © 2026 Chat Aplikacija. Sva prava zadržana.
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-dark-600 hover:text-dark-900 transition-colors"
            >
              <Github size={20} />
            </a>
          </div>
        
        </div>
      </div>
    </footer>
  );
}