'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
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
      // Error handled in context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

      <div className="flex items-center justify-between">
        <label className="flex items-center">
          <input type="checkbox" className="rounded border-dark-300 text-primary-600 focus:ring-primary-500" />
          <span className="ml-2 text-sm text-dark-600">Zapamti me</span>
        </label>
        <Link href="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700">
          Zaboravili ste lozinku?
        </Link>
      </div>

      <Button type="submit" className="w-full" isLoading={isLoading}>
        Prijavi se
      </Button>

      <p className="text-center text-sm text-dark-600">
        Nemate nalog?{' '}
        <Link href="/register" className="text-primary-600 hover:text-primary-700 font-medium">
          Registrujte se
        </Link>
      </p>
    </form>
  );
}