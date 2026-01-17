'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Link from 'next/link';

const loginSchema = z.object({
    email: z.string().email('Unesite validnu email adresu'),
    password: z.string().min(6, 'Lozinka mora imati najmanje 6 karaktera'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true);
        try {
            await login(data);
        } catch (error) {
            // Error je već obrađen u context-u
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            {/* Naslov */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
                    Dobrodošli nazad
                </h2>
                <p style={{ color: '#6b7280' }}>
                    Prijavite se na vaš nalog
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <Input
                    label="Email adresa"
                    type="email"
                    placeholder="vas@email.com"
                    icon={<Mail size={20} />}
                    error={errors.email?.message}
                    {...register('email')}
                />

                <Input
                    label="Lozinka"
                    type="password"
                    placeholder="••••••••"
                    icon={<Lock size={20} />}
                    error={errors.password?.message}
                    {...register('password')}
                />

                {/* Zapamti me i Zaboravili lozinku */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                        <input 
                            type="checkbox" 
                            style={{ 
                                width: '16px', 
                                height: '16px', 
                                borderRadius: '4px',
                                marginRight: '8px',
                                accentColor: '#2563eb'
                            }} 
                        />
                        <span style={{ fontSize: '14px', color: '#4b5563' }}>Zapamti me</span>
                    </label>
                    <Link 
                        href="/forgot-password" 
                        style={{ 
                            fontSize: '14px', 
                            color: '#2563eb', 
                            textDecoration: 'none',
                            fontWeight: '500'
                        }}
                    >
                        Zaboravili ste lozinku?
                    </Link>
                </div>

                {/* DUGME ZA PRIJAVU */}
                <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                        width: '100%',
                        padding: '14px 24px',
                        backgroundColor: isLoading ? '#93c5fd' : '#2563eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
                        marginTop: '8px'
                    }}
                    onMouseOver={(e) => {
                        if (!isLoading) {
                            e.currentTarget.style.backgroundColor = '#1d4ed8';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }
                    }}
                    onMouseOut={(e) => {
                        if (!isLoading) {
                            e.currentTarget.style.backgroundColor = '#2563eb';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }
                    }}
                >
                    {isLoading ? (
                        <>
                            <svg 
                                style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} 
                                fill="none" 
                                viewBox="0 0 24 24"
                            >
                                <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Prijava u toku...
                        </>
                    ) : (
                        <>
                            <LogIn size={20} />
                            Prijavite se
                        </>
                    )}
                </button>

                {/* Link ka registraciji */}
                <p style={{ textAlign: 'center', color: '#6b7280', marginTop: '16px' }}>
                    Nemate nalog?{' '}
                    <Link 
                        href="/register" 
                        style={{ 
                            color: '#2563eb', 
                            fontWeight: '600', 
                            textDecoration: 'none' 
                        }}
                    >
                        Registrujte se
                    </Link>
                </p>
            </form>

            {/* CSS za animaciju spinnera */}
            <style jsx>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}