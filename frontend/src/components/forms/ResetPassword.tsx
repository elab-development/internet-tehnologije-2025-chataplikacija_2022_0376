'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, CheckCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Input from 'components/ui/Input';
import Button from 'components/ui/Button';

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Lozinka mora imati najmanje 6 karaktera'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Lozinke se ne poklapaju',
  path: ['confirmPassword'],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
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

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setError('Token nije pronađen. Molimo kliknite ponovo na link iz email-a.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Greška pri resetovanju lozinke');
      }

      setIsSuccess(true);
      
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Došlo je do greške. Pokušajte ponovo.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
          <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Nevažeći link</h3>
        <p className="text-gray-600 mb-6">
          Link za resetovanje lozinke je nevažeći ili je istekao.
        </p>
        <Link
          href="/forgot-password"
          className="inline-block px-6 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium"
        >
          Zatraži novi link
        </Link>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Lozinka resetovana!</h3>
        <p className="text-gray-600 mb-6">
          Vaša lozinka je uspešno promenjena. Preusmeravamo vas na stranicu za prijavu...
        </p>
        <div className="flex justify-center">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-teal-100 rounded-full mb-4">
          <Lock className="w-6 h-6 text-teal-600" />
        </div>
        <p className="text-sm text-gray-600">
          Unesite novu lozinku za vaš nalog. Koristite snažnu lozinku sa kombinacijom slova i brojeva.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Nova lozinka"
          type="password"
          placeholder="••••••••"
          icon={<Lock size={20} />}
          error={errors.password?.message}
          {...register('password')}
        />

        <Input
          label="Potvrdi lozinku"
          type="password"
          placeholder="••••••••"
          icon={<Lock size={20} />}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button type="submit" className="w-full" isLoading={isLoading}>
          {isLoading ? 'Resetovanje...' : 'Resetuj lozinku'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="text-sm text-gray-600 hover:text-gray-800"
        >
          Nazad na prijavu
        </Link>
      </div>
    </>
  );
} 