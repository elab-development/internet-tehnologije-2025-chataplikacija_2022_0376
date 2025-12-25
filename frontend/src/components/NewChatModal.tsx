'use client';

 

import React, { useState, useEffect } from 'react';

import Modal from '../components/Modal';

import Input from '../components/Input';

import Button from '../components/Button';

import { User } from '../types';

import api from '../lib/api';

import toast from 'react-hot-toast';

import { UserIcon, UserGroupIcon } from '@heroicons/react/24/outline';

 

interface NewChatModalProps {

  isOpen: boolean;

  onClose: () => void;

  onChatCreated: () => void;

}

 

type ChatType = 'private' | 'group';

 

const NewChatModal: React.FC<NewChatModalProps> = ({

  isOpen,

  onClose,

  onChatCreated,

}) => {

  const [chatType, setChatType] = useState<ChatType>('private');

  const [users, setUsers] = useState<User[]>([]);

  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const [groupName, setGroupName] = useState('');

  const [groupDescription, setGroupDescription] = useState('');

  const [searchQuery, setSearchQuery] = useState('');

  const [loading, setLoading] = useState(false);

 

  // Učitavanje liste korisnika

  useEffect(() => {

    if (isOpen) {

      loadUsers();

    }

  }, [isOpen]);

 

  const loadUsers = async () => {

    try {

      // Napomena: Potrebno je kreirati endpoint za dobijanje liste svih korisnika

      const response = await api.get('/users');

      setUsers(response.data);

    } catch (error) {

      console.error('Error loading users:', error);

      toast.error('Greška pri učitavanju korisnika');

    }

  };

 

  // Filtriranje korisnika na osnovu pretrage

  const filteredUsers = users.filter((user) => {

    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();

    return fullName.includes(searchQuery.toLowerCase());

  });

 

  const handleUserToggle = (userId: string) => {

    setSelectedUsers((prev) =>

      prev.includes(userId)

        ? prev.filter((id) => id !== userId)

        : [...prev, userId]

    );

  };

 

  const handleCreateChat = async () => {

    if (chatType === 'private' && selectedUsers.length !== 1) {

      toast.error('Izaberite tačno jednog korisnika za privatni razgovor');

      return;

    }

 

    if (chatType === 'group') {

      if (selectedUsers.length < 2) {

        toast.error('Izaberite najmanje dva korisnika za grupni razgovor');

        return;

      }

      if (!groupName.trim()) {

        toast.error('Unesite naziv grupe');

        return;

      }

    }

 

    setLoading(true);

    try {

      if (chatType === 'private') {

        await api.post('/chats/private', {

          participantId: selectedUsers[0],

        });

      } else {

        await api.post('/chats/group', {

          name: groupName,

          description: groupDescription,

          participantIds: selectedUsers,

        });

      }

 

      toast.success('Razgovor uspešno kreiran');

      onChatCreated();

      handleClose();

    } catch (error: any) {

      toast.error(error.response?.data?.message || 'Greška pri kreiranju razgovora');

    } finally {

      setLoading(false);

    }

  };

 

  const handleClose = () => {

    setChatType('private');

    setSelectedUsers([]);

    setGroupName('');

    setGroupDescription('');

    setSearchQuery('');

    onClose();

  };

 

  return (

    <Modal isOpen={isOpen} onClose={handleClose} title="Novi razgovor">

      <div className="space-y-4">

        {/* Izbor tipa razgovora */}

        <div className="flex space-x-2">

          <button

            onClick={() => setChatType('private')}

            className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors ${

              chatType === 'private'

                ? 'bg-blue-600 text-white'

                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'

            }`}

          >

            <UserIcon className="h-5 w-5" />

            <span>Privatni</span>

          </button>

          <button

            onClick={() => setChatType('group')}

            className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors ${

              chatType === 'group'

                ? 'bg-blue-600 text-white'

                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'

            }`}

          >

            <UserGroupIcon className="h-5 w-5" />

            <span>Grupni</span>

          </button>

        </div>

 

        {/* Polja za grupni razgovor */}

        {chatType === 'group' && (

          <div className="space-y-3">

            <Input

              label="Naziv grupe"

              value={groupName}

              onChange={(e) => setGroupName(e.target.value)}

              placeholder="Unesite naziv grupe"

            />

            <Input

              label="Opis (opciono)"

              value={groupDescription}

              onChange={(e) => setGroupDescription(e.target.value)}

              placeholder="Unesite opis grupe"

            />

          </div>

        )}

 

        {/* Pretraga korisnika */}

        <Input

          label={chatType === 'private' ? 'Izaberite korisnika' : 'Izaberite učesnike'}

          value={searchQuery}

          onChange={(e) => setSearchQuery(e.target.value)}

          placeholder="Pretražite po imenu..."

        />

 

        {/* Lista korisnika */}

        <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">

          {filteredUsers.length === 0 ? (

            <div className="p-4 text-center text-gray-500">Nema korisnika</div>

          ) : (

            filteredUsers.map((user) => (

              <div

                key={user.id}

                onClick={() => handleUserToggle(user.id)}

                className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 flex items-center justify-between ${

                  selectedUsers.includes(user.id) ? 'bg-blue-50' : ''

                }`}

              >

                <div className="flex items-center space-x-3">

                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">

                    <UserIcon className="h-5 w-5 text-blue-600" />

                  </div>

                  <div>

                    <p className="font-medium text-gray-900">

                      {user.firstName} {user.lastName}

                    </p>

                    <p className="text-sm text-gray-500">{user.email}</p>

                  </div>

                </div>

                {selectedUsers.includes(user.id) && (

                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">

                    <svg

                      className="w-4 h-4 text-white"

                      fill="none"

                      strokeLinecap="round"

                      strokeLinejoin="round"

                      strokeWidth="2"

                      viewBox="0 0 24 24"

                      stroke="currentColor"

                    >

                      <path d="M5 13l4 4L19 7"></path>

                    </svg>

                  </div>

                )}

              </div>

            ))

          )}

        </div>

 

        {/* Prikaz broja izabranih korisnika */}

        {selectedUsers.length > 0 && (

          <div className="text-sm text-gray-600">

            Izabrano: {selectedUsers.length}{' '}

            {selectedUsers.length === 1 ? 'korisnik' : 'korisnika'}

          </div>

        )}

 

        {/* Dugmad */}

        <div className="flex space-x-2 pt-4">

          <Button variant="secondary" onClick={handleClose} className="flex-1">

            Otkaži

          </Button>

          <Button

            onClick={handleCreateChat}

            disabled={loading || selectedUsers.length === 0}

            className="flex-1"

          >

            {loading ? 'Kreiranje...' : 'Kreiraj razgovor'}

          </Button>

        </div>

      </div>

    </Modal>

  );

};

 

export default NewChatModal;