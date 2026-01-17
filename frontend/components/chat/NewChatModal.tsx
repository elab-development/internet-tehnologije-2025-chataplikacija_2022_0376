'use client';

import React, { useState, useEffect } from 'react';
import { Search, Users, User as UserIcon, X } from 'lucide-react';
import axios from '../../lib/axios';
import { User } from '../../types/types';
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

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    } else {
      // Reset state kada se modal zatvori
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
      console.error('Error creating chat:', error);
      toast.error(error.response?.data?.message || 'Greška pri kreiranju chata');
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = async (user: User) => {
    if (chatType === 'private') {
      // Za privatni chat - odmah kreiraj
      setLoading(true);
      try {
        const response = await axios.post('/chats/private', {
          participantId: user.id,
        });
        toast.success('Chat kreiran!');
        onChatCreated(response.data.id);
        onClose();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Greška pri kreiranju chata');
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '70vh' }}>
        
        {/* Tip chata */}
        <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: '12px', padding: '4px' }}>
          <button
            onClick={() => { setChatType('private'); setSelectedUsers([]); }}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 500,
              background: chatType === 'private' ? 'white' : 'transparent',
              color: chatType === 'private' ? '#2563eb' : '#6b7280',
              boxShadow: chatType === 'private' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            <UserIcon size={18} />
            Privatni
          </button>
          <button
            onClick={() => { setChatType('group'); setSelectedUsers([]); }}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 500,
              background: chatType === 'group' ? 'white' : 'transparent',
              color: chatType === 'group' ? '#2563eb' : '#6b7280',
              boxShadow: chatType === 'group' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            <Users size={18} />
            Grupni
          </button>
        </div>

        {/* Naziv grupe (samo za grupni) */}
        {chatType === 'group' && (
          <Input
            label="Naziv grupe"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Npr. Dev Tim, Prijatelji..."
          />
        )}

        {/* Izabrani korisnici (za grupni chat) */}
        {chatType === 'group' && selectedUsers.length > 0 && (
          <div>
            <label style={{ fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '8px', display: 'block' }}>
              Izabrani učesnici ({selectedUsers.length})
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {selectedUsers.map((user) => (
                <div
                  key={user.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#dbeafe',
                    color: '#1d4ed8',
                    padding: '6px 10px',
                    borderRadius: '20px',
                    fontSize: '14px'
                  }}
                >
                  <span>{user.firstName} {user.lastName}</span>
                  <button
                    onClick={() => removeSelectedUser(user.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '2px',
                      display: 'flex',
                      color: '#1d4ed8'
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pretraga */}
        <Input
          placeholder="Pretraži korisnike..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={<Search size={18} />}
        />

        {/* Lista korisnika */}
        <div style={{ 
          flex: 1, 
          overflowY: 'auto', 
          border: '1px solid #e5e7eb', 
          borderRadius: '12px',
          minHeight: '250px',
          maxHeight: '300px'
        }}>
          {filteredUsers.length === 0 ? (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              padding: '40px',
              color: '#9ca3af'
            }}>
              <Search size={40} style={{ opacity: 0.3, marginBottom: '8px' }} />
              <p>Nema rezultata</p>
            </div>
          ) : (
            filteredUsers.map((user) => {
              const isSelected = selectedUsers.some((u) => u.id === user.id);
              return (
                <div
                  key={user.id}
                  onClick={() => handleUserClick(user)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #f3f4f6',
                    background: isSelected ? '#eff6ff' : 'white',
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = '#f9fafb';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = isSelected ? '#eff6ff' : 'white';
                  }}
                >
                  <Avatar
                    src={user.avatar}
                    firstName={user.firstName}
                    lastName={user.lastName}
                    size="md"
                    online={user.isOnline}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: '#111827' }}>
                      {user.firstName} {user.lastName}
                    </div>
                    <div style={{ fontSize: '13px', color: '#6b7280' }}>
                      {user.email}
                    </div>
                  </div>
                  {chatType === 'group' && (
                    <div
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        border: isSelected ? 'none' : '2px solid #d1d5db',
                        background: isSelected ? '#2563eb' : 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {isSelected && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          paddingTop: '16px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            {chatType === 'private' 
              ? 'Klikni na korisnika za chat' 
              : `Izabrano: ${selectedUsers.length} (min. 2)`
            }
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button variant="secondary" onClick={onClose}>
              Otkaži
            </Button>
            {chatType === 'group' && (
              <Button
                variant="primary"
                onClick={handleCreateChat}
                isLoading={loading}
                disabled={selectedUsers.length < 2 || !groupName.trim()}
              >
                Započni Grupu
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}