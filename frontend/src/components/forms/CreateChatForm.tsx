'use client';

import React, { useState, useEffect } from 'react';
import { Users, MessageSquare, Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { api } from '@/lib/api';
import { User } from '@/types';

interface CreateChatFormProps {
  onSubmit: (data: { type: 'private' | 'group'; participantIds: string[]; name?: string }) => Promise<void>;
  onCancel: () => void;
}

export const CreateChatForm: React.FC<CreateChatFormProps> = ({ onSubmit, onCancel }) => {
  const [chatType, setChatType] = useState<'private' | 'group'>('private');
  const [groupName, setGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setSearching(true);
      const response = await api.getAllUsers();
      setUsers(response.users || []);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleUserToggle = (user: User) => {
    if (selectedUsers.find(u => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
    } else {
      if (chatType === 'private' && selectedUsers.length >= 1) {
        setSelectedUsers([user]);
      } else {
        setSelectedUsers([...selectedUsers, user]);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedUsers.length === 0) {
      alert('Please select at least one user');
      return;
    }

    if (chatType === 'group' && !groupName.trim()) {
      alert('Please enter a group name');
      return;
    }

    try {
      setLoading(true);
      await onSubmit({
        type: chatType,
        participantIds: selectedUsers.map(u => u.id),
        name: chatType === 'group' ? groupName : undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Chat Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Chat Type
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              setChatType('private');
              setSelectedUsers(selectedUsers.slice(0, 1));
            }}
            className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
              chatType === 'private'
                ? 'border-primary-600 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <MessageSquare className="h-6 w-6" />
            <span className="font-medium">Private Chat</span>
          </button>
          <button
            type="button"
            onClick={() => setChatType('group')}
            className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
              chatType === 'group'
                ? 'border-primary-600 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Users className="h-6 w-6" />
            <span className="font-medium">Group Chat</span>
          </button>
        </div>
      </div>

      {/* Group Name (only for group chats) */}
      {chatType === 'group' && (
        <Input
          label="Group Name"
          placeholder="Enter group name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          required
        />
      )}

      {/* User Search */}
      <div>
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={<Search className="h-5 w-5 text-gray-400" />}
        />
      </div>

      {/* Selected Users */}
      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedUsers.map(user => (
            <div
              key={user.id}
              className="flex items-center gap-2 bg-primary-100 text-primary-800 px-3 py-1 rounded-full"
            >
              <Avatar src={user.avatarUrl} fallbackText={user.username} size="xs" />
              <span className="text-sm font-medium">{user.username}</span>
              <button
                type="button"
                onClick={() => handleUserToggle(user)}
                className="text-primary-600 hover:text-primary-800"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* User List */}
      <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
        {searching ? (
          <div className="p-4 text-center text-gray-500">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No users found</div>
        ) : (
          filteredUsers.map(user => (
            <div
              key={user.id}
              onClick={() => handleUserToggle(user)}
              className={`p-3 flex items-center gap-3 hover:bg-gray-50 cursor-pointer ${
                selectedUsers.find(u => u.id === user.id) ? 'bg-primary-50' : ''
              }`}
            >
              <Avatar
                src={user.avatarUrl}
                fallbackText={user.username}
                size="sm"
                status={user.isOnline ? 'online' : 'offline'}
                showStatus
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{user.username}</p>
                <p className="text-sm text-gray-500 truncate">{user.email}</p>
              </div>
              {selectedUsers.find(u => u.id === user.id) && (
                <div className="text-primary-600">✓</div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button type="button" variant="secondary" fullWidth onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" fullWidth loading={loading}>
          Create Chat
        </Button>
      </div>
    </form>
  );
};