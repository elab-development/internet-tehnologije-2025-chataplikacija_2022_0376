'use client';

 

import React, { useEffect, useRef } from 'react';

import { Message } from '../types';

import { useAuth } from '../context/AuthContext';

import { formatDistanceToNow } from 'date-fns';

import { sr } from 'date-fns/locale';

import {

  PencilIcon,

  TrashIcon,

  ExclamationTriangleIcon,

  CheckIcon,

} from '@heroicons/react/24/outline';

 

interface MessageListProps {

  messages: Message[];

  onEditMessage: (message: Message) => void;

  onDeleteMessage: (messageId: string) => void;

  onReportMessage: (message: Message) => void;

}

 

const MessageList: React.FC<MessageListProps> = ({

  messages,

  onEditMessage,

  onDeleteMessage,

  onReportMessage,

}) => {

  const { user } = useAuth();

  const messagesEndRef = useRef<HTMLDivElement>(null);

 

  // Automatsko skrolovanje na dno kada se dodaju nove poruke

  useEffect(() => {

    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  }, [messages]);

 

  // Formatiranje vremena

  const getTimeAgo = (date: string): string => {

    return formatDistanceToNow(new Date(date), {

      addSuffix: true,

      locale: sr,

    });

  };

 

  // Provera da li je poruka poslata od strane trenutnog korisnika

  const isOwnMessage = (message: Message): boolean => {

    return message.senderId === user?.id;

  };

 

  return (

    <div className="flex-1 overflow-y-auto p-4 space-y-4">

      {messages.length === 0 ? (

        <div className="flex items-center justify-center h-full">

          <p className="text-gray-500">Nema poruka. Započnite razgovor!</p>

        </div>

      ) : (

        messages.map((message) => (

          <div

            key={message.id}

            className={`flex ${isOwnMessage(message) ? 'justify-end' : 'justify-start'}`}

          >

            <div

              className={`max-w-xs md:max-w-md lg:max-w-lg ${

                isOwnMessage(message) ? 'order-2' : 'order-1'

              }`}

            >

              {/* Ime pošiljaoca (samo za tuđe poruke) */}

              {!isOwnMessage(message) && (

                <div className="text-xs text-gray-600 mb-1 px-2">

                  {message.sender.firstName} {message.sender.lastName}

                </div>

              )}

 

              {/* Balon poruke */}

              <div

                className={`rounded-lg px-4 py-2 ${

                  isOwnMessage(message)

                    ? 'bg-blue-600 text-white'

                    : 'bg-gray-200 text-gray-900'

                }`}

              >

                {/* Sadržaj poruke */}

                {message.isDeleted ? (

                  <p className="italic text-sm opacity-75">Poruka obrisana</p>

                ) : (

                  <>

                    {message.type === 'text' && <p className="break-words">{message.content}</p>}

                    {message.type === 'file' && (

                      <div>

                        <p className="mb-2">{message.content}</p>

                        <a

                          href={message.fileUrl}

                          target="_blank"

                          rel="noopener noreferrer"

                          className="text-sm underline"

                        >

                          {message.fileName}

                        </a>

                      </div>

                    )}

                    {message.type === 'gif' && (

                      <div>

                        <p className="mb-2">{message.content}</p>

                        <img

                          src={message.fileUrl}

                          alt="GIF"

                          className="rounded max-w-full"

                        />

                      </div>

                    )}

                  </>

                )}

 

                {/* Vreme i indikator izmene */}

                <div className="flex items-center justify-between mt-1">

                  <span className="text-xs opacity-75">{getTimeAgo(message.createdAt)}</span>

                  {message.isEdited && (

                    <span className="text-xs opacity-75 ml-2">(izmenjeno)</span>

                  )}

                </div>

              </div>

 

              {/* Akcije nad porukom */}

              {!message.isDeleted && (

                <div className="flex items-center space-x-2 mt-1 px-2">

                  {isOwnMessage(message) ? (

                    <>

                      {/* Dugme za izmenu */}

                      <button

                        onClick={() => onEditMessage(message)}

                        className="text-xs text-gray-600 hover:text-blue-600 flex items-center space-x-1"

                        title="Izmeni poruku"

                      >

                        <PencilIcon className="h-3 w-3" />

                        <span>Izmeni</span>

                      </button>

 

                      {/* Dugme za brisanje */}

                      <button

                        onClick={() => onDeleteMessage(message.id)}

                        className="text-xs text-gray-600 hover:text-red-600 flex items-center space-x-1"

                        title="Obriši poruku"

                      >

                        <TrashIcon className="h-3 w-3" />

                        <span>Obriši</span>

                      </button>

                    </>

                  ) : (

                    // Dugme za prijavu poruke

                    <button

                      onClick={() => onReportMessage(message)}

                      className="text-xs text-gray-600 hover:text-red-600 flex items-center space-x-1"

                      title="Prijavi poruku"

                    >

                      <ExclamationTriangleIcon className="h-3 w-3" />

                      <span>Prijavi</span>

                    </button>

                  )}

                </div>

              )}

            </div>

          </div>

        ))

      )}

      <div ref={messagesEndRef} />

    </div>

  );

};

 

export default MessageList;