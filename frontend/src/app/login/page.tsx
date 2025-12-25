'use client';

 

import React, { useState } from 'react';

import { useAuth } from '../../context/AuthContext';

import { useRouter } from 'next/navigation';

import Input from '../../components/Input';

import Button from '../../components/Button';

import Link from 'next/link';

 

const LoginPage: React.FC = () => {

  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');

  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const router = useRouter();

 

  // Validacija forme

  const validateForm = (): boolean => {

    const newErrors: { email?: string; password?: string } = {};

 

    if (!email) {

      newErrors.email = 'Email je obavezan';

    } else if (!/\S+@\S+\.\S+/.test(email)) {

      newErrors.email = 'Uneli ste neispravan email';

    }

 

    if (!password) {

      newErrors.password = 'Lozinka je obavezna';

    }

 

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;

  };

 

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

 

    if (!validateForm()) {

      return;

    }

 

    setLoading(true);

    try {

      await login(email, password);

    } catch (error) {

      console.error('Login error:', error);

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

            Prijavite se

          </h2>

          <p className="mt-2 text-center text-sm text-gray-600">

            Unesite svoje podatke za pristup aplikaciji

          </p>

        </div>

 

        {/* Forma */}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>

          <div className="space-y-4">

            <Input

              label="Email adresa"

              type="email"

              value={email}

              onChange={(e) => setEmail(e.target.value)}

              placeholder="vas.email@primer.com"

              error={errors.email}

              disabled={loading}

            />

 

            <Input

              label="Lozinka"

              type="password"

              value={password}

              onChange={(e) => setPassword(e.target.value)}

              placeholder="••••••••"

              error={errors.password}

              disabled={loading}

            />

          </div>

 

          {/* Link za zaboravljenu lozinku */}

          <div className="flex items-center justify-end">

            <Link

              href="/forgot-password"

              className="text-sm font-medium text-blue-600 hover:text-blue-500"

            >

              Zaboravili ste lozinku?

            </Link>

          </div>

 

          {/* Dugme za prijavu */}

          <Button

            type="submit"

            className="w-full"

            disabled={loading}

          >

            {loading ? 'Prijavljivanje...' : 'Prijavi se'}

          </Button>

 

          {/* Link za registraciju */}

          <div className="text-center">

            <span className="text-sm text-gray-600">

              Nemate nalog?{' '}

              <Link

                href="/register"

                className="font-medium text-blue-600 hover:text-blue-500"

              >

                Registrujte se

              </Link>

            </span>

          </div>

        </form>

      </div>

    </div>

  );

};

 

export default LoginPage;