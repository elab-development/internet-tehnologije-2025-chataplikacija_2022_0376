'use client';

import React, { useState, useEffect } from 'react';
import { Search, Users, User as UserIcon } from 'lucide-react';
import axios from '../../lib/axios';
import { User } from '../../types';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import toast from 'react-hot-toast';
import { cn } from '../../lib/utils';

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
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Greška pri učitavanju korisnika');
    }
  };

  const toggleUserSelection = (user: User) => {
    setSelectedUsers((prev) => {
      const exists = prev.find((u) => u.id === user.id);
      if (exists) {
        return prev.filter((u) => u.id !== user.id);
      } else {
        // Ako je privatni chat, dozvoli samo jednog selektovanog korisnika
        return chatType === 'private' ? [user] : [...prev, user];
      }
    });
  };

  const handleCreateChat = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Molimo izaberite korisnika');
      return;
    }

    setLoading(true);

    try {
      let response;
      
      // PRILAGOĐAVANJE TVOM BACKEND KONTROLERU:
      if (chatType === 'private') {
        // Tvoj backend za privatni chat traži participantId u body-ju
        response = await axios.post('/chats/private', {
          participantId: selectedUsers[0].id,
        });
      } else {
        // Grupni chat traži name i participantIds niz
        if (!groupName.trim()) {
          toast.error('Molimo unesite naziv grupe');
          setLoading(false);
          return;
        }
        response = await axios.post('/chats/group', {
          name: groupName,
          participantIds: selectedUsers.map((u) => u.id),
        });
      }

      toast.success('Chat uspešno kreiran');
      onChatCreated(response.data.id);
      onClose();
    } catch (error: any) {
      console.error('Error creating chat:', error);
      toast.error(error.response?.data?.message || 'Greška pri kreiranju chata');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const searchLower = searchQuery.toLowerCase();
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    return fullName.includes(searchLower) || user.email.toLowerCase().includes(searchLower);
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Započni novi razgovor" size="lg">
      <div className="flex flex-col space-y-4 max-h-[80vh]">
        
        {/* Odabir tipa chata */}
        <div className="flex p-1 bg-gray-100 rounded-xl">
          <button
            onClick={() => { setChatType('private'); setSelectedUsers([]); }}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all",
              chatType === 'private' ? "bg-white shadow text-blue-600" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <UserIcon size={16} /> Privatni
          </button>
          <button
            onClick={() => { setChatType('group'); setSelectedUsers([]); }}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all",
              chatType === 'group' ? "bg-white shadow text-blue-600" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <Users size={16} /> Grupni
          </button>
        </div>

        {/* Unos imena grupe */}
        {chatType === 'group' && (
          <div className="animate-in fade-in slide-in-from-top-2">
            <Input
              label="Naziv grupe"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Unesite naziv vaše grupe..."
              className="border-blue-100 focus:border-blue-500"
            />
          </div>
        )}

        {/* Pretraga */}
        <div className="relative">
          <Input
            placeholder="Pronađi prijatelja po imenu ili email-u..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search size={18} className="text-gray-400" />}
          />
        </div>

        {/* Lista korisnika */}
        <div className="flex-1 overflow-y-auto min-h-[300px] border border-gray-100 rounded-xl">
          {filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Search size={40} className="mb-2 opacity-20" />
              <p>Nismo pronašli korisnika</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filteredUsers.map((user) => {
                const isSelected = selectedUsers.some((u) => u.id === user.id);
                return (
                  <div
                    key={user.id}
                    onClick={() => toggleUserSelection(user)}
                    className={cn(
                      'flex items-center gap-4 p-4 cursor-pointer transition-all hover:bg-gray-50',
                      isSelected && 'bg-blue-50/50 hover:bg-blue-50'
                    )}
                  >
                    <Avatar
                      src={user.avatar}
                      firstName={user.firstName}
                      lastName={user.lastName}
                      size="md"
                      online={user.isOnline}
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 leading-none mb-1">
                        {user.firstName} {user.lastName}
                      </h4>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <div className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                      isSelected ? "bg-blue-600 border-blue-600 shadow-sm" : "border-gray-200"
                    )}>
                      {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer sa dugmetom */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            <div className="text-sm text-gray-500">
                {selectedUsers.length > 0 ? (
                    <span>Izabrano: <strong className="text-blue-600">{selectedUsers.length}</strong></span>
                ) : 'Izaberite nekoga za razgovor'}
            </div>
            <div className="flex gap-3">
                <Button variant="secondary" onClick={onClose} disabled={loading}>
                    Otkaži
                </Button>
                <Button
                    variant="primary"
                    onClick={handleCreateChat}
                    isLoading={loading}
                    disabled={selectedUsers.length === 0 || (chatType === 'group' && !groupName.trim())}
                >
                    Započni Chat
                </Button>
            </div>
        </div>
      </div>
    </Modal>
  );
}