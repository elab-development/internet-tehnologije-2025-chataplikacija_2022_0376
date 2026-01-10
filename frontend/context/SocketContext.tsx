'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Socket } from 'socket.io-client';
import { initSocket, disconnectSocket } from '../lib/socket'; // Dodao sam ../ radi sigurnije putanje
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
}

// 1. Dodajemo export ispred Context-a da bi TypeScript bio srećan
export const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Socket se inicijalizuje samo ako je korisnik ulogovan
    if (user) {
      const token = localStorage.getItem('token');
      if (token) {
        const newSocket = initSocket(token);
        
        newSocket.on('connect', () => {
          setConnected(true);
          console.log('Socket povezan ✅');
        });

        newSocket.on('disconnect', () => {
          setConnected(false);
          console.log('Socket diskonektovan ❌');
        });

        setSocket(newSocket);

        return () => {
          disconnectSocket();
          setSocket(null);
          setConnected(false);
        };
      }
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
}

// 2. Eksportujemo hook za korišćenje u komponentama (ChatWindow, itd.)
export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}