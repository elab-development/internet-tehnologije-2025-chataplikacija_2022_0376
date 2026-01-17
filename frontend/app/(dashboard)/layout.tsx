'use client';

import React from 'react';
import '../globals.css';

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <div 
      style={{ 
        height: '100vh', 
        width: '100vw', 
        overflow: 'hidden',
        display: 'flex',
        backgroundColor: '#ffffff',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
    >
      {children}
    </div>
  );
}