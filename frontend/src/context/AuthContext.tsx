'use client';

 

import React, { createContext, useContext, useState, useEffect } from 'react';

import { useRouter } from 'next/navigation';

import api from '../lib/api';

import { initializeSocket, disconnectSocket } from '../lib/socket';

import { User } from '../types';

import toast from 'react-hot-toast';

 

interface AuthContextType {

  user: User | null;

  loading: boolean;

  login: (email: string, password: string) => Promise<void>;

  register: (data: RegisterData) => Promise<void>;

  logout: () => Promise<void>;

}

 

interface RegisterData {

  email: string;

  password: string;

  firstName: string;

  lastName: string;

}

 

const AuthContext = createContext<AuthContextType | undefined>(undefined);

 

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);

  const router = useRouter();

 

  useEffect(() => {

    const token = localStorage.getItem('token');

    const savedUser = localStorage.getItem('user');

 

    if (token && savedUser) {

      setUser(JSON.parse(savedUser));

      initializeSocket(token);

    }

    setLoading(false);

  }, []);

 

  const login = async (email: string, password: string) => {

    try {

      const response = await api.post('/auth/login', { email, password });

      const { token, user: userData } = response.data;

 

      localStorage.setItem('token', token);

      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);

 

      initializeSocket(token);

      toast.success(response.data.message || 'Uspešno ste ulogovani!');

      router.push('/');

    } catch (error: any) {

      toast.error(error.response?.data?.message || 'Greška pri prijavljivanju');

      throw error;

    }

  };

 

  const register = async (data: RegisterData) => {

    try {

      const response = await api.post('/auth/register', data);

      const { token, user: userData } = response.data;

 

      localStorage.setItem('token', token);

      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);

 

      initializeSocket(token);

      toast.success(response.data.message || 'Uspešno ste se registrovali!');

      router.push('/');

    } catch (error: any) {

      toast.error(error.response?.data?.message || 'Greška pri registraciji');

      throw error;

    }

  };

 

  const logout = async () => {

    try {

      await api.post('/auth/logout');

      localStorage.removeItem('token');

      localStorage.removeItem('user');

      setUser(null);

      disconnectSocket();

      toast.success('Uspešno ste se odjavili');

      router.push('/login');

    } catch (error) {

      console.error('Logout error:', error);

    }

  };

 

  return (

    <AuthContext.Provider value={{ user, loading, login, register, logout }}>

      {children}

    </AuthContext.Provider>

  );

};

 

export const useAuth = () => {

  const context = useContext(AuthContext);

  if (context === undefined) {

    throw new Error('useAuth must be used within an AuthProvider');

  }

  return context;

};