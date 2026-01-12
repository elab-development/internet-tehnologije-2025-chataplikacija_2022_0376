'use client';

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

  const handleChatCreated = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setShowChatOnMobile(true);
    setShowNewChatModal(false); 
  };

  if (!user) return null;

  return (
    <div className="flex h-full w-full bg-white overflow-hidden font-sans">

      {/* LEVA STRANA: Lista konverzacija */}
      <aside
        className={`w-full md:w-[350px] lg:w-[420px] flex-shrink-0 border-r border-gray-100 h-full flex flex-col bg-white transition-all 
          ${showChatOnMobile && selectedConversationId ? 'hidden md:flex' : 'flex'}
        `}
      >
        {/* overflow-y-auto omogućava skrolovanje liste kontakata */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <ChatList
            selectedConversationId={selectedConversationId}
            onSelectConversation={handleSelectConversation}
            onNewChat={() => setShowNewChatModal(true)}
          />
        </div>
      </aside>

      {/* DESNA STRANA: Glavni prozor za čet */}
      <main
        className={`flex-1 h-full bg-[#fcfcfc] 
          ${!showChatOnMobile || !selectedConversationId ? 'hidden md:flex' : 'flex'} 
          flex-col overflow-hidden`}
      >
        {selectedConversationId ? (
          <ChatWindow
            conversationId={selectedConversationId}
            currentUser={user}
            onBack={() => setShowChatOnMobile(false)}
          />
        ) : (
          /* Prazno stanje */
          <div className="flex-1 flex flex-col items-center justify-center p-12 bg-gray-50/50">
            <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mb-6">
              <MessageSquare size={40} className="text-blue-500" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Vaš inbox</h2>
            <p className="text-center text-gray-500 max-w-sm leading-relaxed">
              Izaberite postojeću konverzaciju ili započnite novu klikom na dugme.
            </p>
            <button
              onClick={() => setShowNewChatModal(true)}
              className="mt-6 px-6 py-2.5 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors shadow-sm"
            >
              Započni novo ćaskanje
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