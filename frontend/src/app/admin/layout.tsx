'use client';

import React, { useState } from 'react';
import { useAuth } from 'context/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from 'components/layout/Navbar';
import Sidebar from 'components/layout/Sidebar';
import Footer from 'components/layout/Footer';
import { Loader2, ShieldAlert } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  React.useEffect(() => {
    if (!loading && (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR'))) {
      router.push('/chat');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-dark-50">
        <Loader2 className="animate-spin text-primary-600" size={48} />
      </div>
    );
  }

  if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-dark-50">
        <ShieldAlert size={64} className="text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-dark-900 mb-2">Nemate Pristup</h1>
        <p className="text-dark-600">Ova stranica je dostupna samo administratorima.</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <Navbar onMenuClick={() => setIsSidebarOpen(true)} showMenuButton />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <main className="flex-1 overflow-y-auto bg-dark-50">
          {children}
        </main>
      </div>
    </div>
  );
}