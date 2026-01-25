'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Avatar from 'components/ui/Avatar';
import Button from 'components/ui/Button';
import { LogOut, Settings, User as UserIcon, Bell, Menu, Shield } from 'lucide-react';

interface NavbarProps {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

export default function Navbar({ onMenuClick, showMenuButton = false }: NavbarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  if (!user) return null;

  const isModerator = user.role?.toUpperCase() === 'ADMIN' || user.role?.toUpperCase() === 'MODERATOR';

  return (
    <nav className="h-16 bg-white border-b border-dark-200 px-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        {showMenuButton && (
          <Button variant="ghost" size="sm" onClick={onMenuClick} className="lg:hidden">
            <Menu size={24} />
          </Button>
        )}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          <h1 className="text-xl font-bold text-dark-900 hidden sm:block">Chat App</h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <Button variant="ghost" size="sm" onClick={() => setShowNotifications(!showNotifications)} className="relative">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </Button>
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-dark-200 z-50">
              <div className="p-4 border-b border-dark-200"><h3 className="font-semibold text-dark-900">Obaveštenja</h3></div>
              <div className="max-h-96 overflow-y-auto"><div className="p-8 text-center text-dark-500">Nema novih obaveštenja</div></div>
            </div>
          )}
        </div>

        <div className="relative">
          <button onClick={() => setShowDropdown(!showDropdown)} className="flex items-center gap-2 hover:bg-dark-50 rounded-lg p-2 transition-colors">
            <Avatar src={user.avatar} firstName={user.firstName} lastName={user.lastName} size="sm" online />
            <div className="hidden sm:block text-left min-w-[80px]">
              <p className="text-sm font-medium text-dark-900 leading-none mb-1">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-[10px] font-bold text-blue-600 flex items-center gap-1 uppercase tracking-wider">
                {isModerator && <Shield size={10} className="fill-blue-50" />}
                {user.role}
              </p>
            </div>
          </button>

          {showDropdown && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-dark-200 py-1 z-50">
                <div className="px-4 py-3 border-b border-dark-200">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-dark-900">{user.firstName} {user.lastName}</p>
                    {isModerator && <Shield size={12} className="text-blue-600 fill-blue-50" />}
                  </div>
                  <p className="text-xs text-dark-500">{user.email}</p>
                </div>
                <button onClick={() => { router.push('/profile'); setShowDropdown(false); }} className="w-full px-4 py-2 text-sm text-left hover:bg-dark-50 flex items-center gap-2"><UserIcon size={16} /> Profil</button>
                <button onClick={() => { router.push('/settings'); setShowDropdown(false); }} className="w-full px-4 py-2 text-sm text-left hover:bg-dark-50 flex items-center gap-2"><Settings size={16} /> Podešavanja</button>
                {user.role === 'ADMIN' && (
                  <button onClick={() => { router.push('/admin/reports'); setShowDropdown(false); }} className="w-full px-4 py-2 text-sm text-left hover:bg-dark-50 flex items-center gap-2 border-t border-dark-200"><Settings size={16} /> Admin Panel</button>
                )}
                <button onClick={logout} className="w-full px-4 py-2 text-sm text-left hover:bg-red-50 flex items-center gap-2 text-red-600 border-t border-dark-200"><LogOut size={16} /> Odjavi se</button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}