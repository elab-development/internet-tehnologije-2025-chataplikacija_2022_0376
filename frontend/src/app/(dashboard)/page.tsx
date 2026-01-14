'use client';

import React from 'react';
import { ChatList } from '@/components/chat/ChatList';
import { ChatWindow } from '@/components/chat/ChatWindow';

export default function DashboardPage() {
  return (
    <div className="flex h-screen overflow-hidden">
      <ChatList />
      <ChatWindow />
    </div>
  );
}