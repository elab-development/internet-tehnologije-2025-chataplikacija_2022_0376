'use client';

import React, { useState } from 'react';
import { useAuth } from 'context/AuthContext';
import ChatList from 'components/chat/ChatList';
import ChatWindow from 'components/chat/ChatWindow';
import NewChatModal from 'components/chat/NewChatModal';
import { MessageSquare, Plus } from 'lucide-react';

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
    <>
      {/* SIDEBAR - Lista konverzacija */}
      <aside
        style={{
          width: '400px',
          minWidth: '320px',
          maxWidth: '400px',
          flexShrink: 0,
          borderRight: '1px solid #e5e7eb',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#ffffff',
          overflowY: 'auto'
        }}
      >
        <ChatList
          selectedConversationId={selectedConversationId}
          onSelectConversation={handleSelectConversation}
          onNewChat={() => setShowNewChatModal(true)}
        />
      </aside>

      {/* MAIN - Chat prozor ili empty state */}
      <main
        style={{
          flex: 1,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          backgroundColor: '#f9fafb'
        }}
      >
        {selectedConversationId ? (
          <ChatWindow
            conversationId={selectedConversationId}
            currentUser={user}
            onBack={() => setShowChatOnMobile(false)}
          />
        ) : (
          /* Prazno stanje - kada nema izabranog chata */
          <div 
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '48px 24px',
              backgroundColor: '#f9fafb'
            }}
          >
            {/* Ikona */}
            <div 
              style={{
                width: '100px',
                height: '100px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '32px',
                boxShadow: '0 20px 40px rgba(59, 130, 246, 0.3)'
              }}
            >
              <MessageSquare size={48} color="#ffffff" strokeWidth={1.5} />
            </div>

            {/* Naslov */}
            <h2 
              style={{
                fontSize: '28px',
                fontWeight: 700,
                color: '#1f2937',
                marginBottom: '12px',
                textAlign: 'center'
              }}
            >
              Vaše poruke
            </h2>

            {/* Opis */}
            <p 
              style={{
                color: '#6b7280',
                marginBottom: '32px',
                lineHeight: 1.7,
                textAlign: 'center',
                maxWidth: '360px',
                fontSize: '16px'
              }}
            >
              Izaberite postojeću konverzaciju sa leve strane ili započnite novu.
            </p>

            {/* DUGME - Novo ćaskanje */}
            <button
              onClick={() => setShowNewChatModal(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '14px 32px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                borderRadius: '50px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#1d4ed8';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(37, 99, 235, 0.5)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#2563eb';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(37, 99, 235, 0.4)';
              }}
            >
              <Plus size={22} strokeWidth={2.5} />
              Novo ćaskanje
            </button>
          </div>
        )}
      </main>

      {/* Modal za novi chat */}
      <NewChatModal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        onChatCreated={handleChatCreated}
      />
    </>
  );
}