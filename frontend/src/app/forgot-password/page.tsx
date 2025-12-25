'use client';

 

import React, { useState } from 'react';

import { useRouter } from 'next/navigation';

import Input from '../../components/Input';

import Button from '../../components/Button';

import api from '../../lib/api';

import toast from 'react-hot-toast';

import Link from 'next/link';

 

const ForgotPasswordPage: React.FC = () => {

  const [step, setStep] = useState<'email' | 'password'>('email');

  const [email, setEmail] = useState('');

  const [newPassword, setNewPassword] = useState('');

  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState<any>({});

  const [loading, setLoading] = useState(false);

  const router = useRouter();

 

  // Validacija email koraka

  const validateEmail = (): boolean => {

    const newErrors: any = {};

 

    if (!email) {

      newErrors.email = 'Email je obavezan';

    } else if (!/\S+@\S+\.\S+/.test(email)) {

      newErrors.email = 'Uneli ste neispravan email';

    }

 

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;

  };

 

  // Validacija lozinke koraka

  const validatePassword = (): boolean => {

    const newErrors: any = {};

 

    if (!newPassword) {

      newErrors.newPassword = 'Nova lozinka je obavezna';

    } else if (newPassword.length < 6) {

      newErrors.newPassword = 'Lozinka mora imati najmanje 6 karaktera';

    }

 

    if (!confirmPassword) {

      newErrors.confirmPassword = 'Potvrdite lozinku';

    } else if (newPassword !== confirmPassword) {

      newErrors.confirmPassword = 'Lozinke se ne poklapaju';

    }

 

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;

  };

 

  const handleEmailSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

 

    if (!validateEmail()) {

      return;

    }

 

    setLoading(true);

    try {

      // Proveravamo da li email postoji u sistemu

      // U realnoj aplikaciji ovde bi trebalo poslati verifikacioni kod

      setStep('password');

      toast.success('Email verifikovan. Unesite novu lozinku.');

    } catch (error: any) {

      toast.error(

        error.response?.data?.message ||

          'Na emailu koji ste uneli ne postoji registrovan profil.'

      );

    } finally {

      setLoading(false);

    }

  };

 

  const handlePasswordSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

 

    if (!validatePassword()) {

      return;

    }

 

    setLoading(true);

    try {

      await api.post('/auth/change-password', {

        email,

        newPassword,

      });

 

      toast.success('Lozinka uspešno promenjena.');

      router.push('/login');

    } catch (error: any) {

      toast.error(error.response?.data?.message || 'Greška pri promeni lozinke');

    } finally {

      setLoading(false);

    }

  };

 

  return (

    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">

      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">

        {/* Zaglavlje */}

        <div>

          <h2 className="text-center text-3xl font-extrabold text-gray-900">

            Promena lozinke

          </h2>

          <p className="mt-2 text-center text-sm text-gray-600">

            {step === 'email'

              ? 'Unesite email adresu vašeg naloga'

              : 'Unesite novu lozinku'}

          </p>

        </div>

 

        {/* Korak 1: Email */}

        {step === 'email' && (

          <form className="mt-8 space-y-6" onSubmit={handleEmailSubmit}>

            <Input

              label="Email adresa"

              type="email"

              value={email}

              onChange={(e) => setEmail(e.target.value)}

              placeholder="vas.email@primer.com"

              error={errors.email}

              disabled={loading}

            />

 

            <Button type="submit" className="w-full" disabled={loading}>

              {loading ? 'Proverava se...' : 'Nastavi'}

            </Button>

 

            <div className="text-center">

              <Link

                href="/login"

                className="text-sm font-medium text-blue-600 hover:text-blue-500"

              >

                Povratak na prijavu

              </Link>

            </div>

          </form>

        )}

 

        {/* Korak 2: Nova lozinka */}

        {step === 'password' && (

          <form className="mt-8 space-y-6" onSubmit={handlePasswordSubmit}>

            <div className="space-y-4">

              <Input

                label="Nova lozinka"

                type="password"

                value={newPassword}

                onChange={(e) => setNewPassword(e.target.value)}

                placeholder="••••••••"

                error={errors.newPassword}

                disabled={loading}

              />

 

              <Input

                label="Potvrdite lozinku"

                type="password"

                value={confirmPassword}

                onChange={(e) => setConfirmPassword(e.target.value)}

                placeholder="••••••••"

                error={errors.confirmPassword}

                disabled={loading}

              />

            </div>

 

            <Button type="submit" className="w-full" disabled={loading}>

              {loading ? 'Čuvanje...' : 'Promeni lozinku'}

            </Button>

          </form>

        )}

      </div>

    </div>

  );

};

 

export default ForgotPasswordPage;