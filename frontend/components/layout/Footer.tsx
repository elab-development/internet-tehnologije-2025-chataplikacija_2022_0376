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
            <span>od strane</span>
            <span className="font-semibold text-dark-900">
              Jovana Grujić, Ana Dobrijević, Milica Gojković
            </span>
          </div>

          {/* Center Section */}
          <div className="text-sm text-dark-500">
            © 2024 Chat Aplikacija. Sva prava zadržana.
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

        {/* Team Info */}
        <div className="mt-4 pt-4 border-t border-dark-200">
          <div className="text-center text-xs text-dark-500">
            <p className="mb-2">Univerzitet u Beogradu - Fakultet organizacionih nauka</p>
            <div className="flex flex-wrap justify-center gap-4">
              <span>Jovana Grujić (2022/0376)</span>
              <span>•</span>
              <span>Ana Dobrijević (2022/0032)</span>
              <span>•</span>
              <span>Milica Gojković (2022/0124)</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}