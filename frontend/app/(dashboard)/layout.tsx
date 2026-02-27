'use client';

import React, { useState } from 'react'; 
import '../globals.css';
import Navbar from 'components/layout/Navbar';
import Footer from 'components/layout/Footer';

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-white">
      
      {/* 1. NAVBAR (Gore) */}
      <Navbar 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
        showMenuButton={true} 
      />

        {/* 3. GLAVNI SADRŽAJ */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
          
          {/* 4. FOOTER (Ispod sadržaja) */}
          <Footer />
        </main>
      </div>
  );
}