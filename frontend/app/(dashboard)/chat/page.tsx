'use client';

import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import ChatList from '../../../components/chat/ChatList';
import ChatWindow from '../../../components/chat/ChatWindow';
import NewChatModal from '../../../components/chat/NewChatModal';
import { MessageSquare, Plus, Loader2 } from 'lucide-react';

export default function ChatPage() {
  const { user, loading } = useAuth();
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>();
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setShowChatOnMobile(true);
  };

  const handleChatCreated = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setShowChatOnMobile(true);
    setShowNewChatModal(false);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-screen">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-full w-full overflow-hidden bg-white">
      {/* SIDEBAR - Lista konverzacija */}
      {/* Klasa 'lg:flex' osigurava da je na desktopu uvek vidljiv, bez obzira na stanje */}
      <aside
        className={`${
          showChatOnMobile ? 'hidden' : 'flex'
        } lg:flex flex-col w-full lg:w-[400px] flex-shrink-0 border-r border-gray-200 h-full bg-white overflow-y-auto`}
      >
        <ChatList
          currentUser={user}
          selectedConversationId={selectedConversationId}
          onSelectConversation={handleSelectConversation}
          onNewChat={() => setShowNewChatModal(true)}
        />
      </aside>

      {/* MAIN - Chat prozor */}
      {/* Klasa 'lg:flex' osigurava da desna strana popuni ostatak ekrana na desktopu */}
      <main
        className={`${
          !showChatOnMobile ? 'hidden' : 'flex'
        } lg:flex flex-1 flex-col h-full overflow-hidden bg-gray-50`}
      >
        {selectedConversationId ? (
          <ChatWindow
            conversationId={selectedConversationId}
            currentUser={user}
            onBack={() => {
              setShowChatOnMobile(false);
              setSelectedConversationId(undefined);
            }}
          />
        ) : (
          /* Prazno stanje - vidljivo samo na desktopu kada ništa nije izabrano */
          <div className="hidden lg:flex flex-1 flex-col items-center justify-center p-12 bg-gray-50 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center mb-8 shadow-xl shadow-blue-200">
              <MessageSquare size={48} color="#ffffff" strokeWidth={1.5} />
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-3">Vaše poruke</h2>

            <p className="text-gray-500 mb-8 max-w-[360px] leading-relaxed text-lg">
              Izaberite postojeću konverzaciju sa leve strane ili započnite novu.
            </p>

            <button
              onClick={() => setShowNewChatModal(true)}
              className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold transition-all shadow-lg shadow-blue-200 active:scale-95"
            >
              <Plus size={22} strokeWidth={2.5} />
              Novo ćaskanje
            </button>
          </div>
        )}
      </main>

      <NewChatModal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        onChatCreated={handleChatCreated}
      />
    </div>
  );
}