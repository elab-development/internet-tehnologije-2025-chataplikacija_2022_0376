'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageSquare, Users, Settings, Shield, Bell } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

interface MenuItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  roles?: UserRole[];
}

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user } = useAuth();

  const menuItems: MenuItem[] = [
    {
      name: 'Messages',
      href: '/',
      icon: MessageSquare,
    },
    {
      name: 'Contacts',
      href: '/contacts',
      icon: Users,
    },
    {
      name: 'Notifications',
      href: '/notifications',
      icon: Bell,
      badge: 3,
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
    },
  ];

  // Add admin menu if user is admin/moderator
  if (user && (user.role === UserRole.ADMIN || user.role === UserRole.MODERATOR)) {
    menuItems.push({
      name: 'Admin',
      href: '/admin',
      icon: Shield,
      roles: [UserRole.ADMIN, UserRole.MODERATOR],
    });
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            // Check role permissions
            if (item.roles && user && !item.roles.includes(user.role as UserRole)) {
              return null;
            }

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={clsx(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <Icon className={clsx('h-5 w-5', isActive && 'text-primary-600')} />
                  <span className="flex-1">{item.name}</span>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info Footer */}
      {user && (
        <div className="p-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            <p className="font-medium text-gray-900">{user.username}</p>
            <p className="text-xs truncate">{user.email}</p>
          </div>
        </div>
      )}
    </aside>
  );
};