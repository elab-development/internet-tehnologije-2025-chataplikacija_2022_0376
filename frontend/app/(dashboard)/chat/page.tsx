'use client';

import React, { useState, useEffect } from 'react';
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
  const [componentKey, setComponentKey] = useState(0); // 🔥 Dodato za forsiranje renderovanja

  // 🔥 Prati promenu user-a i forsiraj renderovanje
  useEffect(() => {
    if (user) {
      console.log('👤 ChatPage: user promenjen na:', user.id, user.firstName, user.lastName);
      setComponentKey(prev => prev + 1); // Forsiraj ponovno renderovanje
    }
  }, [user?.id]); // Prati samo promenu ID-a

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

  console.log('🎯 ChatPage render - current user:', user.id, user.firstName, user.lastName);

  return (
    <div key={componentKey} className="flex h-full w-full overflow-hidden bg-white"> {/* 🔥 Dodat key */}
      {/* SIDEBAR - Lista konverzacija */}
      <aside
        className={`${
          showChatOnMobile ? 'hidden' : 'flex'
        } lg:flex flex-col w-full lg:w-[400px] flex-shrink-0 border-r border-gray-200 h-full bg-white relative`} 
      >
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <ChatList
            currentUser={user}
            selectedConversationId={selectedConversationId}
            onSelectConversation={handleSelectConversation}
            onNewChat={() => setShowNewChatModal(true)}
          />
        </div>
        <div className="absolute bottom-6 right-6 lg:right-6">
          <button
            onClick={() => setShowNewChatModal(true)}
            className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all active:scale-90 z-50 border-2 border-white"
            title="Novo ćaskanje"
          >
            <Plus size={30} strokeWidth={2.5} />
          </button>
        </div>
      </aside>

      {/* MAIN - Chat prozor */}
      <main
        className={`${
          !showChatOnMobile ? 'hidden' : 'flex'
        } lg:flex flex-1 flex-col h-full overflow-hidden bg-gray-50`}
      >
        {selectedConversationId ? (
          <ChatWindow
            key={`${selectedConversationId}-${user.id}`} // 🔥 Dodat key sa user ID
            conversationId={selectedConversationId}
            currentUser={user}
            onBack={() => {
              setShowChatOnMobile(false);
              setSelectedConversationId(undefined);
            }}
          />
        ) : (
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