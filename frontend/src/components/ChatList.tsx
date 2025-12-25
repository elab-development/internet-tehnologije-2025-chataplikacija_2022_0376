'use client';

 

import React, { useState, useEffect } from 'react';

import { Chat, User } from '../types';

import { useAuth } from '../context/AuthContext';

import Card from '../components/Card';

import { formatDistanceToNow } from 'date-fns';

import { sr } from 'date-fns/locale';

import {

  MagnifyingGlassIcon,

  PlusIcon,

  UserGroupIcon,

  UserIcon,

} from '@heroicons/react/24/outline';

 

interface ChatListProps {

  chats: Chat[];

  selectedChatId: string | null;

  onSelectChat: (chatId: string) => void;

  onNewChat: () => void;

}

 

const ChatList: React.FC<ChatListProps> = ({

  chats,

  selectedChatId,

  onSelectChat,

  onNewChat,

}) => {

  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');

  const [filteredChats, setFilteredChats] = useState<Chat[]>(chats);

 

  // Filtriranje razgovora na osnovu pretrage

  useEffect(() => {

    if (!searchQuery) {

      setFilteredChats(chats);

      return;

    }

 

    const query = searchQuery.toLowerCase();

    const filtered = chats.filter((chat) => {

      if (chat.type === 'group') {

        return chat.name?.toLowerCase().includes(query);

      } else {

        // Za privatne razgovore, pretražujemo po imenu drugog korisnika

        const otherUser = chat.memberships.find((m) => m.userId !== user?.id)?.user;

        if (!otherUser) return false;

        const fullName = `${otherUser.firstName} ${otherUser.lastName}`.toLowerCase();

        return fullName.includes(query);

      }

    });

 

    setFilteredChats(filtered);

  }, [searchQuery, chats, user]);

 

  // Dobijanje naziva razgovora

  const getChatName = (chat: Chat): string => {

    if (chat.type === 'group') {

      return chat.name || 'Grupni razgovor';

    }

    const otherUser = chat.memberships.find((m) => m.userId !== user?.id)?.user;

    return otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : 'Nepoznato';

  };

 

  // Dobijanje poslednje poruke

  const getLastMessage = (chat: Chat): string => {

    if (!chat.messages || chat.messages.length === 0) {

      return 'Nema poruka';

    }

    const lastMessage = chat.messages[chat.messages.length - 1];

    if (lastMessage.isDeleted) {

      return 'Poruka obrisana';

    }

    return lastMessage.content.substring(0, 50) + (lastMessage.content.length > 50 ? '...' : '');

  };

 

  // Formatiranje vremena

  const getTimeAgo = (date: string): string => {

    return formatDistanceToNow(new Date(date), {

      addSuffix: true,

      locale: sr,

    });

  };

 

  return (

    <div className="h-full flex flex-col bg-white border-r border-gray-200">

      {/* Zaglavlje sa pretragom */}

      <div className="p-4 border-b border-gray-200">

        <div className="flex items-center justify-between mb-4">

          <h2 className="text-xl font-bold text-gray-800">Razgovori</h2>

          <button

            onClick={onNewChat}

            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"

            title="Novi razgovor"

          >

            <PlusIcon className="h-5 w-5" />

          </button>

        </div>

 

        {/* Polje za pretragu */}

        <div className="relative">

          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />

          <input

            type="text"

            placeholder="Pretraži razgovore..."

            value={searchQuery}

            onChange={(e) => setSearchQuery(e.target.value)}

            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"

          />

        </div>

      </div>

 

      {/* Lista razgovora */}

      <div className="flex-1 overflow-y-auto">

        {filteredChats.length === 0 ? (

          <div className="p-4 text-center text-gray-500">

            {searchQuery ? 'Nema rezultata pretrage' : 'Nemate aktivnih razgovora'}

          </div>

        ) : (

          filteredChats.map((chat) => (

            <div

              key={chat.id}

              onClick={() => onSelectChat(chat.id)}

              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${

                selectedChatId === chat.id ? 'bg-blue-50' : ''

              }`}

            >

              <div className="flex items-start space-x-3">

                {/* Ikona */}

                <div

                  className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${

                    chat.type === 'group' ? 'bg-purple-100' : 'bg-blue-100'

                  }`}

                >

                  {chat.type === 'group' ? (

                    <UserGroupIcon className="h-6 w-6 text-purple-600" />

                  ) : (

                    <UserIcon className="h-6 w-6 text-blue-600" />

                  )}

                </div>

 

                {/* Informacije o razgovoru */}

                <div className="flex-1 min-w-0">

                  <div className="flex items-center justify-between">

                    <h3 className="text-sm font-semibold text-gray-900 truncate">

                      {getChatName(chat)}

                    </h3>

                    {chat.messages && chat.messages.length > 0 && (

                      <span className="text-xs text-gray-500">

                        {getTimeAgo(chat.messages[chat.messages.length - 1].createdAt)}

                      </span>

                    )}

                  </div>

                  <p className="text-sm text-gray-600 truncate mt-1">

                    {getLastMessage(chat)}

                  </p>

                </div>

              </div>

            </div>

          ))

        )}

      </div>

    </div>

  );

};

 

export default ChatList;