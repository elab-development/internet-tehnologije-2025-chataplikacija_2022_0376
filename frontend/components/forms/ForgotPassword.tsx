'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import Input from 'components/ui/Input';
import Button from 'components/ui/Button';

const forgotPasswordSchema = z.object({
  email: z.string().email('Unesite validnu email adresu'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Greška pri slanju zahteva');
      }

      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Došlo je do greške. Pokušajte ponovo.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Email poslat!</h3>
        <p className="text-gray-600 mb-6">
          Proverite email <strong>{getValues('email')}</strong> za instrukcije za resetovanje lozinke.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Link za reset će isteći za 1 sat.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center text-teal-600 hover:text-teal-700 font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Nazad na prijavu
        </Link>
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
          <Mail className="w-6 h-6 text-teal-600" />
        </div>
        <p className="text-sm text-gray-600">
          Unesite email adresu povezanu sa vašim nalogom i poslaćemo vam link za resetovanje lozinke.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Email adresa"
          type="email"
          placeholder="vas@email.com"
          icon={<Mail size={20} />}
          error={errors.email?.message}
          {...register('email')}
        />

        <Button type="submit" className="w-full" isLoading={isLoading}>
          {isLoading ? 'Slanje...' : 'Pošalji link za reset'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Nazad na prijavu
        </Link>
      </div>
    </>
  );
}