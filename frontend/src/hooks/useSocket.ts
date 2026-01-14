'use client';

import { useEffect, useState } from 'react';
import { initSocket, getSocket, disconnectSocket } from '@/lib/socket';
import { useAuth } from './useAuth';

export const useSocket = () => {
  const { user, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const socket = initSocket();

    socket.on('connect', () => {
      setIsConnected(true);

      socket.emit('user:connect', {
        userId: user.id,
        username: user.username,
      });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      disconnectSocket();
    };
  }, [isAuthenticated, user]);

  return {
    isConnected,
    socket: getSocket(),
  };
};
