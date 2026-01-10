'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Link from 'next/link';

const registerSchema = z.object({
  firstName: z.string().min(2, 'Ime mora imati najmanje 2 karaktera'),
  lastName: z.string().min(2, 'Prezime mora imati najmanje 2 karaktera'),
  email: z.string().email('Unesite validnu email adresu'),
  password: z.string().min(6, 'Lozinka mora imati najmanje 6 karaktera'),
  confirmPassword: z.string(),
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
      const { confirmPassword, ...registerData } = data;
      await registerUser(registerData);
    } catch (error) {
      // Error handled in context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Ime"
          placeholder="Ime"
          icon={<User size={20} />}
          error={errors.firstName?.message}
          {...register('firstName')}
        />
        <Input
          label="Prezime"
          placeholder="Prezime"
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
        label="Potvrda lozinke"
        type="password"
        placeholder="••••••••"
        icon={<Lock size={20} />}
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />

      <Button type="submit" className="w-full" isLoading={isLoading}>
        Registruj se
      </Button>

      <p className="text-center text-sm text-dark-600">
        Već imate nalog?{' '}
        <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
          Prijavite se
        </Link>
      </p>
    </form>
  );
}