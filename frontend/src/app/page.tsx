'use client';

 

import React, { useState, useEffect } from 'react';

import { useAuth } from '../context/AuthContext';

import { useRouter } from 'next/navigation';

import NavBar from '../components/NavBar';

import ChatList from '../components/ChatList';

import MessageList from '../components/MessageList';

import MessageInput from '../components/MessageInput';

import NewChatModal from '../components/NewChatModal';

import ReportMessageModal from '../components/ReportMessageModal';

import EditMessageModal from '../components/EditMessageModal';

import { Chat, Message } from '../types';

import api from '../lib/api';

import { getSocket } from '../lib/socket';

import toast from 'react-hot-toast';

 

const HomePage: React.FC = () => {

  const { user, loading: authLoading } = useAuth();

  const router = useRouter();

 

  // State za čet aplikaciju

  const [chats, setChats] = useState<Chat[]>([]);

  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);

  const [loading, setLoading] = useState(true);

 

  // State za modale

  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [messageToReport, setMessageToReport] = useState<Message | null>(null);

  const [messageToEdit, setMessageToEdit] = useState<Message | null>(null);

 

  // Preusmjeravanje na login ako korisnik nije prijavljen

  useEffect(() => {

    if (!authLoading && !user) {

      router.push('/login');

    }

  }, [user, authLoading, router]);

 

  // Učitavanje razgovora

  useEffect(() => {

    if (user) {

      loadChats();

    }

  }, [user]);

 

  // Učitavanje poruka kada se izabere razgovor

  useEffect(() => {

    if (selectedChatId) {

      loadMessages(selectedChatId);

      joinChatRoom(selectedChatId);

    }

  }, [selectedChatId]);

 

  // WebSocket event listeners

  useEffect(() => {

    const socket = getSocket();

    if (!socket) return;

 

    // Primanje nove poruke

    socket.on('new_message', (data: Message) => {

      if (data.chatId === selectedChatId) {

        setMessages((prev) => [...prev, data]);

      }

      // Ažuriranje liste razgovora

      loadChats();

    });

 

    // Primanje izmenjene poruke

    socket.on('message_edited', (data: Message) => {

      if (data.chatId === selectedChatId) {

        setMessages((prev) =>

          prev.map((msg) => (msg.id === data.id ? data : msg))

        );

      }

    });

 

    // Primanje obrisane poruke

    socket.on('message_deleted', (data: { messageId: string; chatId: string }) => {

      if (data.chatId === selectedChatId) {

        setMessages((prev) =>

          prev.map((msg) =>

            msg.id === data.messageId

              ? { ...msg, isDeleted: true, content: 'Poruka obrisana' }

              : msg

          )

        );

      }

    });

 

    return () => {

      socket.off('new_message');

      socket.off('message_edited');

      socket.off('message_deleted');

    };

  }, [selectedChatId]);

 

  const loadChats = async () => {

    try {

      const response = await api.get('/chats');

      setChats(response.data);

    } catch (error) {

      console.error('Error loading chats:', error);

      toast.error('Greška pri učitavanju razgovora');

    } finally {

      setLoading(false);

    }

  };

 

  const loadMessages = async (chatId: string) => {

    try {

      const response = await api.get(`/messages/chat/${chatId}`);

      setMessages(response.data);

    } catch (error) {

      console.error('Error loading messages:', error);

      toast.error('Greška pri učitavanju poruka');

    }

  };

 

  const joinChatRoom = (chatId: string) => {

    const socket = getSocket();

    if (socket) {

      socket.emit('join_chat', chatId);

    }

  };

 

  const handleSendMessage = async (

    content: string,

    type: 'text' | 'file' | 'gif',

    fileData?: any

  ) => {

    if (!selectedChatId) return;

 

    try {

      let fileUrl = '';

      let fileName = '';

 

      // Ako je datoteka, prvo je uploadujemo

      if (type === 'file' && fileData) {

        const formData = new FormData();

        formData.append('file', fileData);

 

        // Napomena: Potrebno je implementirati endpoint za upload datoteka

        const uploadResponse = await api.post('/upload', formData, {

          headers: { 'Content-Type': 'multipart/form-data' },

        });

 

        fileUrl = uploadResponse.data.url;

        fileName = fileData.name;

      }

 

      const response = await api.post('/messages', {

        chatId: selectedChatId,

        content,

        type,

        fileUrl,

        fileName,

      });

 

      const newMessage = response.data;

 

      // Dodavanje poruke lokalno

      setMessages((prev) => [...prev, newMessage]);

 

      // Emitovanje preko WebSocket-a

      const socket = getSocket();

      if (socket) {

        socket.emit('send_message', newMessage);

      }

 

      // Ažuriranje liste razgovora

      loadChats();

    } catch (error: any) {

      console.error('Error sending message:', error);

      toast.error(error.response?.data?.message || 'Greška pri slanju poruke');

    }

  };

 

  const handleEditMessage = (message: Message) => {

    setMessageToEdit(message);

    setIsEditModalOpen(true);

  };

 

  const handleDeleteMessage = async (messageId: string) => {

    if (!confirm('Da li ste sigurni da želite da obrišete ovu poruku?')) {

      return;

    }

 

    try {

      await api.delete(`/messages/${messageId}`);

 

      // Ažuriranje lokalno

      setMessages((prev) =>

        prev.map((msg) =>

          msg.id === messageId

            ? { ...msg, isDeleted: true, content: 'Poruka obrisana' }

            : msg

        )

      );

 

      // Emitovanje preko WebSocket-a

      const socket = getSocket();

      if (socket) {

        socket.emit('delete_message', { messageId, chatId: selectedChatId });

      }

 

      toast.success('Poruka uspešno obrisana');

    } catch (error: any) {

      console.error('Error deleting message:', error);

      toast.error(error.response?.data?.message || 'Greška pri brisanju poruke');

    }

  };

 

  const handleReportMessage = (message: Message) => {

    setMessageToReport(message);

    setIsReportModalOpen(true);

  };

 

  const handleMessageEdited = () => {

    if (selectedChatId) {

      loadMessages(selectedChatId);

    }

  };

 

  const handleChatCreated = () => {

    loadChats();

  };

 

  const getSelectedChat = (): Chat | undefined => {

    return chats.find((chat) => chat.id === selectedChatId);

  };

 

  const getChatName = (chat: Chat): string => {

    if (chat.type === 'group') {

      return chat.name || 'Grupni razgovor';

    }

    const otherUser = chat.memberships.find((m) => m.userId !== user?.id)?.user;

    return otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : 'Nepoznato';

  };

 

  if (authLoading || loading) {

    return (

      <div className="min-h-screen flex items-center justify-center">

        <div className="text-center">

          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>

          <p className="mt-4 text-gray-600">Učitavanje...</p>

        </div>

      </div>

    );

  }

 

  return (

    <div className="h-screen flex flex-col">

      <NavBar />

 

      <div className="flex-1 flex overflow-hidden">

        {/* Lista razgovora */}

        <div className="w-full md:w-1/3 lg:w-1/4">

          <ChatList

            chats={chats}

            selectedChatId={selectedChatId}

            onSelectChat={setSelectedChatId}

            onNewChat={() => setIsNewChatModalOpen(true)}

          />

        </div>

 

        {/* Prostor za poruke */}

        <div className="hidden md:flex md:w-2/3 lg:w-3/4 flex-col bg-gray-50">

          {selectedChatId ? (

            <>

              {/* Zaglavlje razgovora */}

              <div className="bg-white border-b border-gray-200 p-4">

                <h2 className="text-xl font-semibold text-gray-800">

                  {getChatName(getSelectedChat()!)}

                </h2>

                {getSelectedChat()?.type === 'group' && (

                  <p className="text-sm text-gray-600">

                    {getSelectedChat()!.memberships.length} članova

                  </p>

                )}

              </div>

 

              {/* Lista poruka */}

              <MessageList

                messages={messages}

                onEditMessage={handleEditMessage}

                onDeleteMessage={handleDeleteMessage}

                onReportMessage={handleReportMessage}

              />

 

              {/* Unos poruke */}

              <MessageInput onSendMessage={handleSendMessage} />

            </>

          ) : (

            <div className="flex-1 flex items-center justify-center">

              <div className="text-center text-gray-500">

                <p className="text-lg mb-2">Izaberite razgovor</p>

                <p className="text-sm">

                  Kliknite na razgovor sa leve strane ili kreirajte novi

                </p>

              </div>

            </div>

          )}

        </div>

      </div>

 

      {/* Modali */}

      <NewChatModal

        isOpen={isNewChatModalOpen}

        onClose={() => setIsNewChatModalOpen(false)}

        onChatCreated={handleChatCreated}

      />

 

      <ReportMessageModal

        isOpen={isReportModalOpen}

        onClose={() => setIsReportModalOpen(false)}

        message={messageToReport}

      />

 

      <EditMessageModal

        isOpen={isEditModalOpen}

        onClose={() => setIsEditModalOpen(false)}

        message={messageToEdit}

        onMessageEdited={handleMessageEdited}

      />

    </div>

  );

};

 

export default HomePage;
