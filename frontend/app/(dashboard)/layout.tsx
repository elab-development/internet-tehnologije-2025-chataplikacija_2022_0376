'use client';

import '../globals.css'; 
import React, { useState } from 'react';
import { useAuth } from 'context/AuthContext';
import ChatList from 'components/chat/ChatList';
import ChatWindow from 'components/chat/ChatWindow';
import NewChatModal from 'components/chat/NewChatModal';
import { MessageSquare } from 'lucide-react';

export default function ChatPage() {
  const { user } = useAuth();
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>();
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setShowChatOnMobile(true);
  };

  if (!user) return null;
  return (
    <div className="flex h-full w-full bg-white">
      {/* SIDEBAR - Levi deo */}
      <div
        className={`w-full md:w-[350px] lg:w-[400px] flex-shrink-0 border-r border-gray-200 h-full flex flex-col ${
          showChatOnMobile && selectedConversationId ? 'hidden md:flex' : 'flex'
        }`}
      >
        <ChatList
          selectedConversationId={selectedConversationId}
          onSelectConversation={handleSelectConversation}
          onNewChat={() => setShowNewChatModal(true)}
        />
      </div>

      {/* CHAT WINDOW - Desni deo */}
      <div
        className={`flex-1 h-full bg-gray-50 ${
          !showChatOnMobile || !selectedConversationId ? 'hidden md:flex' : 'flex'
        } flex-col`}
      >
        {selectedConversationId ? (
          <ChatWindow
            conversationId={selectedConversationId}
            currentUser={user}
            onBack={() => setShowChatOnMobile(false)}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
            <div className="bg-gray-100 p-6 rounded-full mb-4">
              <MessageSquare size={48} className="text-gray-300" />
            </div>
            <h2 className="text-xl font-medium text-gray-600">Vaše poruke</h2>
            <p className="text-center mt-2 max-w-xs text-sm">
              Izaberite osobu ili grupu iz liste sa leve strane da biste započeli razgovor.
            </p>
          </div>
        )}
      </div>

      {/* Modal za Privatno / Grupno caskanje */}
      <NewChatModal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        onChatCreated={(id) => {
          handleSelectConversation(id);
          setShowNewChatModal(false);
        }}
      />
    </div>
  );
}