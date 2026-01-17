'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import Input from '../../components/ui/Input';
import Link from 'next/link';
import axios from '../../lib/axios';
import toast from 'react-hot-toast';

const forgotPasswordSchema = z.object({
    email: z.string().email('Unesite validnu email adresu'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async (data: ForgotPasswordFormData) => {
        setIsLoading(true);
        try {
            await axios.post('/auth/forgot-password', data);
            setIsSuccess(true);
            toast.success('Link za resetovanje je poslat na vaš email!');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Greška pri slanju emaila');
        } finally {
            setIsLoading(false);
        }
    };

    // Uspešno poslat email
    if (isSuccess) {
        return (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
                {/* Ikona uspeha */}
                <div 
                    style={{
                        width: '80px',
                        height: '80px',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px'
                    }}
                >
                    <CheckCircle size={40} color="white" />
                </div>

                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '12px' }}>
                    Email je poslat!
                </h2>

                <p style={{ color: '#6b7280', marginBottom: '24px', lineHeight: '1.6' }}>
                    Proverite vaš inbox i kliknite na link za resetovanje lozinke. 
                    Link važi 1 sat.
                </p>

                <Link
                    href="/login"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 24px',
                        backgroundColor: '#2563eb',
                        color: 'white',
                        borderRadius: '10px',
                        textDecoration: 'none',
                        fontWeight: '600',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <ArrowLeft size={20} />
                    Nazad na prijavu
                </Link>
            </div>
        );
    }

    return (
        <div>
            {/* Nazad link */}
            <Link
                href="/login"
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#6b7280',
                    textDecoration: 'none',
                    fontSize: '14px',
                    marginBottom: '24px'
                }}
            >
                <ArrowLeft size={18} />
                Nazad na prijavu
            </Link>

            {/* Naslov */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <div 
                    style={{
                        width: '64px',
                        height: '64px',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px'
                    }}
                >
                    <Mail size={32} color="white" />
                </div>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
                    Zaboravili ste lozinku?
                </h2>
                <p style={{ color: '#6b7280', lineHeight: '1.5' }}>
                    Unesite vašu email adresu i poslaćemo vam link za resetovanje lozinke.
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

                {/* DUGME ZA SLANJE */}
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
                            Slanje u toku...
                        </>
                    ) : (
                        <>
                            <Send size={20} />
                            Pošalji link za reset
                        </>
                    )}
                </button>
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