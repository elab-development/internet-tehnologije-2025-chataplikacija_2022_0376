'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, CheckCircle, AlertCircle } from 'lucide-react';
import Input from '../../components/ui/Input';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from '../../lib/axios';
import toast from 'react-hot-toast';

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Lozinka mora imati najmanje 6 karaktera'),
  confirmPassword: z.string().min(6, 'Potvrdite lozinku'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Lozinke se ne poklapaju',
  path: ['confirmPassword'],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [tokenError, setTokenError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    if (!token) {
      setTokenError('Token za resetovanje nije pronađen');
    }
  }, [token]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast.error('Token za resetovanje nije validan');
      return;
    }

    setIsLoading(true);
    try {
      await axios.post('/auth/reset-password', {
        token,
        password: data.password,
      });

      setIsSuccess(true);
      toast.success('Lozinka uspešno promenjena!');

      // Preusmeri na login nakon 2 sekunde
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error: any) {
      console.error('Reset password error:', error);
      
      if (error.response?.status === 400) {
        toast.error('Token je nevažeći ili je istekao');
        setTokenError('Token je nevažeći ili je istekao');
      } else {
        toast.error(error.response?.data?.message || 'Greška pri resetovanju lozinke');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Uspešno resetovana lozinka
  if (isSuccess) {
    return (
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
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
          Lozinka promenjena!
        </h2>

        <p style={{ color: '#6b7280', marginBottom: '24px', lineHeight: '1.6' }}>
          Vaša lozinka je uspešno resetovana. 
          Bićete preusmereni na stranicu za prijavu...
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
            fontWeight: '600'
          }}
        >
          Idi na prijavu
        </Link>
      </div>
    );
  }

  // Token greška
  if (tokenError) {
    return (
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <div 
          style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px'
          }}
        >
          <AlertCircle size={40} color="white" />
        </div>

        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '12px' }}>
          Nevažeći link
        </h2>

        <p style={{ color: '#6b7280', marginBottom: '24px', lineHeight: '1.6' }}>
          {tokenError}. Molimo vas da zatražite novi link za resetovanje lozinke.
        </p>

        <Link
          href="/forgot-password"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            backgroundColor: '#2563eb',
            color: 'white',
            borderRadius: '10px',
            textDecoration: 'none',
            fontWeight: '600'
          }}
        >
          Zatraži novi link
        </Link>
      </div>
    );
  }

  return (
    <div>
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
          <Lock size={32} color="white" />
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
          Resetujte lozinku
        </h2>
        <p style={{ color: '#6b7280', lineHeight: '1.5' }}>
          Unesite novu lozinku za vaš nalog
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Input
          label="Nova lozinka"
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
        >
          {isLoading ? (
            <>
              <div 
                style={{ 
                  width: '20px', 
                  height: '20px', 
                  border: '2px solid white', 
                  borderTopColor: 'transparent', 
                  borderRadius: '50%', 
                  animation: 'spin 1s linear infinite' 
                }} 
              />
              Resetovanje...
            </>
          ) : (
            <>
              <Lock size={20} />
              Resetuj lozinku
            </>
          )}
        </button>

        <p style={{ textAlign: 'center', color: '#6b7280', marginTop: '16px', fontSize: '14px' }}>
          Setili ste se lozinke?{' '}
          <Link 
            href="/login" 
            style={{ color: '#2563eb', fontWeight: '600', textDecoration: 'none' }}
          >
            Prijavite se
          </Link>
        </p>
      </form>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}