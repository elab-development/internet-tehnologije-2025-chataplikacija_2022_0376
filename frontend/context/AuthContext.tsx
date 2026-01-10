'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import axios from '../lib/axios';
import { User, AuthResponse, LoginCredentials, RegisterData } from '../types';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      const response = await axios.get('/auth/me');
      setUser(response.data.user);
    } catch (error) {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await axios.post<AuthResponse>('/auth/login', credentials);
      const { user, token } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
      toast.success('Uspešno ste se prijavili!');
      router.push('/chat');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Greška pri prijavljivanju');
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await axios.post<AuthResponse>('/auth/register', data);
      const { user, token } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
      toast.success('Uspešno ste se registrovali!');
      router.push('/chat');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Greška pri registraciji');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Uspešno ste se odjavili!');
    router.push('/login');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}