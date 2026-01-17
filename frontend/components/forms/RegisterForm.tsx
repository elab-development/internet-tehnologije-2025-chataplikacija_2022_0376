'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, User, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Link from 'next/link';

const registerSchema = z.object({
    firstName: z.string().min(2, 'Ime mora imati najmanje 2 karaktera'),
    lastName: z.string().min(2, 'Prezime mora imati najmanje 2 karaktera'),
    email: z.string().email('Unesite validnu email adresu'),
    password: z.string().min(6, 'Lozinka mora imati najmanje 6 karaktera'),
    confirmPassword: z.string().min(6, 'Potvrdite lozinku'),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Lozinke se ne poklapaju',
    path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterForm() {
    const [isLoading, setIsLoading] = useState(false);
    const { register: registerUser } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterFormData) => {
        setIsLoading(true);
        try {
            await registerUser({
                email: data.email,
                password: data.password,
                firstName: data.firstName,
                lastName: data.lastName,
            });
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
                    Kreirajte nalog
                </h2>
                <p style={{ color: '#6b7280' }}>
                    Pridružite se zajednici
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Ime i Prezime u jednom redu */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <Input
                        label="Ime"
                        type="text"
                        placeholder="Vaše ime"
                        icon={<User size={20} />}
                        error={errors.firstName?.message}
                        {...register('firstName')}
                    />

                    <Input
                        label="Prezime"
                        type="text"
                        placeholder="Vaše prezime"
                        icon={<User size={20} />}
                        error={errors.lastName?.message}
                        {...register('lastName')}
                    />
                </div>

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

                <Input
                    label="Potvrdite lozinku"
                    type="password"
                    placeholder="••••••••"
                    icon={<Lock size={20} />}
                    error={errors.confirmPassword?.message}
                    {...register('confirmPassword')}
                />

                {/* Uslovi korišćenja */}
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', marginTop: '8px' }}>
                    <input 
                        type="checkbox" 
                        required
                        style={{ 
                            width: '18px', 
                            height: '18px', 
                            borderRadius: '4px',
                            marginTop: '2px',
                            accentColor: '#2563eb',
                            flexShrink: 0
                        }} 
                    />
                    <span style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.5' }}>
                        Slažem se sa{' '}
                        <Link href="/terms" style={{ color: '#2563eb', textDecoration: 'none' }}>
                            Uslovima korišćenja
                        </Link>
                        {' '}i{' '}
                        <Link href="/privacy" style={{ color: '#2563eb', textDecoration: 'none' }}>
                            Politikom privatnosti
                        </Link>
                    </span>
                </label>

                {/* DUGME ZA REGISTRACIJU */}
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
                            Registracija u toku...
                        </>
                    ) : (
                        <>
                            <UserPlus size={20} />
                            Registrujte se
                        </>
                    )}
                </button>

                {/* Link ka loginu */}
                <p style={{ textAlign: 'center', color: '#6b7280', marginTop: '16px' }}>
                    Već imate nalog?{' '}
                    <Link 
                        href="/login" 
                        style={{ 
                            color: '#2563eb', 
                            fontWeight: '600', 
                            textDecoration: 'none' 
                        }}
                    >
                        Prijavite se
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