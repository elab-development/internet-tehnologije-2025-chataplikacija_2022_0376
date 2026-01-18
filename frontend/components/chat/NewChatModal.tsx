'use client';

import React, { useState, useEffect } from 'react';
import { Search, Users, User as UserIcon, X } from 'lucide-react';
import axios from '../../lib/axios';
import { User } from '../../types/types';
import { useAuth } from '../../context/AuthContext'; // DODATO
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import toast from 'react-hot-toast';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChatCreated: (conversationId: string) => void;
}

export default function NewChatModal({ isOpen, onClose, onChatCreated }: NewChatModalProps) {
  const [chatType, setChatType] = useState<'private' | 'group'>('private');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [groupName, setGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const { user: currentUser } = useAuth(); // Uzimamo ulogovanog korisnika

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    } else {
      setChatType('private');
      setSelectedUsers([]);
      setGroupName('');
      setSearchQuery('');
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/users');
      // FILTRIRAMO listu tako da ne vidiš sebe
      const otherUsers = response.data.filter((u: User) => u.id !== currentUser?.id);
      setUsers(otherUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Greška pri učitavanju korisnika');
    }
  };

  const handleCreateChat = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Molimo izaberite bar jednog korisnika');
      return;
    }

    if (chatType === 'group' && !groupName.trim()) {
      toast.error('Molimo unesite naziv grupe');
      return;
    }

    if (chatType === 'group' && selectedUsers.length < 2) {
      toast.error('Grupni chat zahteva najmanje 2 učesnika');
      return;
    }

    setLoading(true);
    try {
      let response;
      if (chatType === 'private') {
        response = await axios.post('/chats/private', {
          participantId: selectedUsers[0].id,
        });
      } else {
        response = await axios.post('/chats/group', {
          name: groupName,
          participantIds: selectedUsers.map((u) => u.id),
        });
      }

      toast.success(chatType === 'private' ? 'Chat kreiran!' : 'Grupa kreirana!');
      onChatCreated(response.data.id);
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Greška pri kreiranju chata');
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = async (user: User) => {
    if (chatType === 'private') {
      // Za privatni chat - odmah šaljemo zahtev
      setLoading(true);
      try {
        const response = await axios.post('/chats/private', {
          participantId: user.id,
        });
        onChatCreated(response.data.id);
        onClose();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Greška');
      } finally {
        setLoading(false);
      }
    } else {
      // Za grupni chat - toggle selekcija
      toggleUserSelection(user);
    }
  };

  const toggleUserSelection = (user: User) => {
    setSelectedUsers((prev) => {
      const exists = prev.find((u) => u.id === user.id);
      if (exists) {
        return prev.filter((u) => u.id !== user.id);
      } else {
        return [...prev, user];
      }
    });
  };

  const removeSelectedUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const filteredUsers = users.filter((user) => {
    const searchLower = searchQuery.toLowerCase();
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    return fullName.includes(searchLower) || user.email.toLowerCase().includes(searchLower);
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Započni novi razgovor" size="lg">
      <div className="flex flex-col gap-4 max-h-[75vh]">
        
        {/* Toggle Tip Chata */}
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => { setChatType('private'); setSelectedUsers([]); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              chatType === 'private' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <UserIcon size={18} />
            Privatni
          </button>
          <button
            onClick={() => { setChatType('group'); setSelectedUsers([]); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              chatType === 'group' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users size={18} />
            Grupni
          </button>
        </div>

        {chatType === 'group' && (
          <Input
            label="Naziv grupe"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Npr. Dev Tim, Prijatelji..."
            className="focus:ring-blue-500"
          />
        )}

        {/* Chipovi za izabrane korisnike */}
        {chatType === 'group' && selectedUsers.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Učesnici ({selectedUsers.length})
            </label>
            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-1">
              {selectedUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm border border-blue-100 animate-in fade-in zoom-in duration-200">
                  <span>{user.firstName}</span>
                  <button onClick={() => removeSelectedUser(user.id)} className="hover:bg-blue-200 rounded-full p-0.5 transition-colors">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <Input
          placeholder="Pretraži po imenu ili email-u..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={<Search size={18} className="text-gray-400" />}
        />

        {/* Lista korisnika */}
        <div className="flex-1 overflow-y-auto border border-gray-100 rounded-xl min-h-[300px] bg-gray-50/30">
          {filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Search size={40} className="mb-2 opacity-20" />
              <p>Korisnik nije pronađen</p>
            </div>
          ) : (
            filteredUsers.map((user) => {
              const isSelected = selectedUsers.some((u) => u.id === user.id);
              return (
                <div
                  key={user.id}
                  onClick={() => handleUserClick(user)}
                  className={`flex items-center gap-3 p-3 cursor-pointer border-b border-gray-50 transition-colors ${
                    isSelected ? 'bg-blue-50/50' : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <Avatar
                    src={user.avatar}
                    firstName={user.firstName}
                    lastName={user.lastName}
                    size="md"
                    online={user.isOnline}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  {chatType === 'group' && (
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'
                    }`}>
                      {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <span className="text-xs text-gray-400 font-medium">
            {chatType === 'private' 
              ? 'Izaberi osobu za direktnu poruku' 
              : `Izabrano: ${selectedUsers.length} korisnika`}
          </span>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={onClose}>
              Otkaži
            </Button>
            {chatType === 'group' && (
              <Button
                variant="primary"
                onClick={handleCreateChat}
                isLoading={loading}
                disabled={selectedUsers.length < 2 || !groupName.trim()}
                className="px-6"
              >
                Kreiraj Grupu
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}