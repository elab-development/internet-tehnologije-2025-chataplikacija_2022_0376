'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import Cookies from 'js-cookie';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
}

export const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Ako nema ulogovanog korisnika, ugasi postojeći socket
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    // Uzmi token direktno iz kolačića
    const token = Cookies.get('auth_token');
    
    if (!token) {
      console.warn('⚠️ Socket: Token nije pronađen u kolačićima još uvek.');
      return;
    }

    const socketUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

    const newSocket = io(socketUrl, {
      auth: { token },
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('✅ Socket povezan:', newSocket.id);
      setConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('🔌 Socket diskonektovan:', reason);
      setConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket greška pri konekciji:', error.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]); // Re-run kada se user promeni (logovanje/izlogovanje)

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}