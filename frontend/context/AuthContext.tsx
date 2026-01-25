'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import axios from '../lib/axios';
import { User, LoginCredentials, RegisterData } from '../types/types';
import toast from 'react-hot-toast';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (user: User) => void;
    checkAuth: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        console.log('🔄 AuthProvider mounted, checking auth...');
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            console.log('🔍 Checking authentication...');
            const response = await axios.get('/auth/me');
            console.log('✅ Auth check response:', response.data);
            
            if (response.data && response.data.user) {
                setUser(response.data.user);
                console.log('👤 User set:', response.data.user);
            } else {
                setUser(null);
                console.log('❌ No user data in response');
            }
        } catch (error: any) {
            console.log('⚠️ Not authenticated:', error.response?.status, error.message);
            setUser(null);
        } finally {
            setLoading(false);
            console.log('✅ Auth check complete, loading = false');
        }
    };

    const login = async (credentials: LoginCredentials) => {
        try {
            console.log('🚀 Starting login with:', { email: credentials.email });
            
            const response = await axios.post('/auth/login', credentials);
            console.log('✅ Login response:', response.data);
            
            if (response.data && response.data.user) {
                setUser(response.data.user);
                console.log('👤 User set after login:', response.data.user);
                toast.success('Uspešno ste se prijavili!');
                
                console.log('🔄 Redirecting to /chat...');
                router.push('/chat');
            } else {
                console.error('❌ No user data in login response');
                toast.error('Greška: Nema podataka o korisniku');
                throw new Error('No user data in response');
            }
        } catch (error: any) {
            console.error('❌ Login error:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            toast.error(error.response?.data?.message || 'Greška pri prijavljivanju');
            throw error;
        }
    };

    const register = async (data: RegisterData) => {
        try {
            console.log('🚀 Starting registration with:', {
                email: data.email,
                firstName: data.firstName,
                lastName: data.lastName
            });
            
            const response = await axios.post('/auth/register', data);
            console.log('✅ Registration response:', response.data);
            
            if (response.data && response.data.user) {
                setUser(response.data.user);
                console.log('👤 User set after registration:', response.data.user);
                toast.success('Uspešno ste se registrovali!');
                
                console.log('🔄 Redirecting to /chat...');
                router.push('/chat');
            } else {
                console.error('❌ No user data in registration response');
                toast.error('Greška: Nema podataka o korisniku');
                throw new Error('No user data in response');
            }
        } catch (error: any) {
            console.error('❌ Registration error:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            toast.error(error.response?.data?.message || 'Greška pri registraciji');
            throw error;
        }
    };

    const logout = async () => {
        try {
            console.log('🚀 Starting logout...');
            await axios.post('/auth/logout');
            console.log('✅ Logout successful');
        } catch (error) {
            console.error('❌ Logout error:', error);
        }
        setUser(null);
        toast.success('Uspešno ste se odjavili!');
        router.push('/login'); // ✅ IZMENA
    };

    const updateUser = (updatedUser: User) => {
        console.log('🔄 Updating user:', updatedUser);
        setUser(updatedUser);
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            loading, 
            login, 
            register, 
            logout, 
            updateUser,
            checkAuth 
        }}>
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