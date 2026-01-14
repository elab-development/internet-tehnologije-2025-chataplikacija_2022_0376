'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from 'context/AuthContext';
import {
  MessageCircle,
  Users,
  Settings,
  Shield,
  AlertTriangle,
  X,
} from 'lucide-react';
import { cn } from 'lib/utils';
import Button from 'components/ui/Button';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  const navigation = [
    {
      name: 'Chatovi',
      href: '/chat',
      icon: MessageCircle,
      roles: ['USER', 'ADMIN', 'MODERATOR'],
    },
    {
      name: 'Korisnici',
      href: '/users',
      icon: Users,
      roles: ['ADMIN', 'MODERATOR'],
    },
    {
      name: 'Prijave',
      href: '/admin/reports',
      icon: AlertTriangle,
      roles: ['ADMIN', 'MODERATOR'],
    },
    {
      name: 'Admin Panel',
      href: '/admin',
      icon: Shield,
      roles: ['ADMIN'],
    },
    {
      name: 'Podešavanja',
      href: '/settings',
      icon: Settings,
      roles: ['USER', 'ADMIN', 'MODERATOR'],
    },
  ];

  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(user?.role || 'USER')
  );

  const handleNavigate = (href: string) => {
    router.push(href);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && onClose && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50',
          'w-64 bg-white border-r border-dark-200',
          'transform transition-transform duration-200 ease-in-out',
          'lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Mobile Close Button */}
        {onClose && (
          <div className="lg:hidden flex justify-end p-4">
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={24} />
            </Button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex flex-col gap-1 p-4">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                onClick={() => handleNavigate(item.href)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                  'text-sm font-medium',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-dark-700 hover:bg-dark-50'
                )}
              >
                <Icon size={20} />
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-dark-200 bg-dark-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold">
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-dark-900 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-dark-500">{user?.role}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}