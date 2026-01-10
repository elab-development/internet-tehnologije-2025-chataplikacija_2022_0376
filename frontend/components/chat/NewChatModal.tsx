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
      // Reset state when closing
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
        return chatType === 'private' ? [user] : [...prev, user];
      }
    });
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

    setLoading(true);

    try {
      const response = await axios.post('/conversations', {
        type: chatType,
        participantIds: selectedUsers.map((u) => u.id),
        name: chatType === 'group' ? groupName : undefined,
      });

      toast.success(chatType === 'group' ? 'Grupni chat kreiran' : 'Chat kreiran');
      onChatCreated(response.data.id);
      onClose();
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error('Greška pri kreiranju chata');
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
    <Modal isOpen={isOpen} onClose={onClose} title="Novi Chat" size="lg">
      <div className="space-y-6">
        {/* Chat Type Selection */}
        <div className="flex gap-2">
          <Button
            variant={chatType === 'private' ? 'primary' : 'secondary'}
            onClick={() => setChatType('private')}
            className="flex-1"
          >
            <UserIcon size={18} />
            Privatni
          </Button>
          <Button
            variant={chatType === 'group' ? 'primary' : 'secondary'}
            onClick={() => setChatType('group')}
            className="flex-1"
          >
            <Users size={18} />
            Grupni
          </Button>
        </div>

        {/* Group Name Input */}
        {chatType === 'group' && (
          <Input
            label="Naziv grupe"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Unesite naziv grupe"
          />
        )}

        {/* Selected Users */}
        {selectedUsers.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 bg-primary-50 rounded-lg">
            {selectedUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm"
              >
                <Avatar
                  src={user.avatar}
                  firstName={user.firstName}
                  lastName={user.lastName}
                  size="sm"
                />
                <span className="text-sm font-medium text-dark-900">
                  {user.firstName} {user.lastName}
                </span>
                <button
                  onClick={() => toggleUserSelection(user)}
                  className="text-dark-400 hover:text-dark-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Search */}
        <Input
          placeholder="Pretražite korisnike..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={<Search size={18} />}
        />

        {/* Users List */}
        <div className="max-h-80 overflow-y-auto border border-dark-200 rounded-lg">
          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-dark-500">
              Nema korisnika
            </div>
          ) : (
            <div className="divide-y divide-dark-100">
              {filteredUsers.map((user) => {
                const isSelected = selectedUsers.some((u) => u.id === user.id);
                
                return (
                  <div
                    key={user.id}
                    onClick={() => toggleUserSelection(user)}
                    className={cn(
                      'flex items-center gap-3 p-4 cursor-pointer transition-colors',
                      'hover:bg-dark-50',
                      isSelected && 'bg-primary-50 hover:bg-primary-100'
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
                      <h4 className="font-medium text-dark-900">
                        {user.firstName} {user.lastName}
                      </h4>
                      <p className="text-sm text-dark-600">{user.email}</p>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={onClose}>
            Otkaži
          </Button>
          <Button
            variant="primary"
            onClick={handleCreateChat}
            isLoading={loading}
            disabled={selectedUsers.length === 0 || (chatType === 'group' && !groupName.trim())}
          >
            Kreiraj Chat
          </Button>
        </div>
      </div>
    </Modal>
  );
}