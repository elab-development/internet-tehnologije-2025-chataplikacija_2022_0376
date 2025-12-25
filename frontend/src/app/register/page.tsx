'use client';

 

import React, { useState } from 'react';

import { useAuth } from '../../context/AuthContext';

import Input from '../../components/Input';

import Button from '../../components/Button';

import Link from 'next/link';

 

interface FormData {

  email: string;

  password: string;

  confirmPassword: string;

  firstName: string;

  lastName: string;

}

 

interface FormErrors {

  email?: string;

  password?: string;

  confirmPassword?: string;

  firstName?: string;

  lastName?: string;

}

 

const RegisterPage: React.FC = () => {

  const [formData, setFormData] = useState<FormData>({

    email: '',

    password: '',

    confirmPassword: '',

    firstName: '',

    lastName: '',

  });

  const [errors, setErrors] = useState<FormErrors>({});

  const [loading, setLoading] = useState(false);

  const { register } = useAuth();

 

  // Ažuriranje vrednosti polja

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    const { name, value } = e.target;

    setFormData((prev) => ({

      ...prev,

      [name]: value,

    }));

    // Uklanjanje greške kada korisnik počne da unosi

    if (errors[name as keyof FormErrors]) {

      setErrors((prev) => ({

        ...prev,

        [name]: undefined,

      }));

    }

  };

 

  // Validacija forme

  const validateForm = (): boolean => {

    const newErrors: FormErrors = {};

 

    // Validacija email-a

    if (!formData.email) {

      newErrors.email = 'Email je obavezan';

    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {

      newErrors.email = 'Uneli ste neispravan email';

    }

 

    // Validacija lozinke

    if (!formData.password) {

      newErrors.password = 'Lozinka je obavezna';

    } else if (formData.password.length < 6) {

      newErrors.password = 'Lozinka mora imati najmanje 6 karaktera';

    }

 

    // Validacija potvrde lozinke

    if (!formData.confirmPassword) {

      newErrors.confirmPassword = 'Potvrdite lozinku';

    } else if (formData.password !== formData.confirmPassword) {

      newErrors.confirmPassword = 'Lozinke se ne poklapaju';

    }

 

    // Validacija imena

    if (!formData.firstName) {

      newErrors.firstName = 'Ime je obavezno';

    }

 

    // Validacija prezimena

    if (!formData.lastName) {

      newErrors.lastName = 'Prezime je obavezno';

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

      await register({

        email: formData.email,

        password: formData.password,

        firstName: formData.firstName,

        lastName: formData.lastName,

      });

    } catch (error) {

      console.error('Registration error:', error);

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

            Registrujte se

          </h2>

          <p className="mt-2 text-center text-sm text-gray-600">

            Kreirajte novi nalog i započnite komunikaciju

          </p>

        </div>

 

        {/* Forma */}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>

          <div className="space-y-4">

            {/* Ime */}

            <Input

              label="Ime"

              name="firstName"

              type="text"

              value={formData.firstName}

              onChange={handleChange}

              placeholder="Unesite ime"

              error={errors.firstName}

              disabled={loading}

            />

 

            {/* Prezime */}

            <Input

              label="Prezime"

              name="lastName"

              type="text"

              value={formData.lastName}

              onChange={handleChange}

              placeholder="Unesite prezime"

              error={errors.lastName}

              disabled={loading}

            />

 

            {/* Email */}

            <Input

              label="Email adresa"

              name="email"

              type="email"

              value={formData.email}

              onChange={handleChange}

              placeholder="vas.email@primer.com"

              error={errors.email}

              disabled={loading}

            />

 

            {/* Lozinka */}

            <Input

              label="Lozinka"

              name="password"

              type="password"

              value={formData.password}

              onChange={handleChange}

              placeholder="••••••••"

              error={errors.password}

              disabled={loading}

            />

 

            {/* Potvrda lozinke */}

            <Input

              label="Potvrdite lozinku"

              name="confirmPassword"

              type="password"

              value={formData.confirmPassword}

              onChange={handleChange}

              placeholder="••••••••"

              error={errors.confirmPassword}

              disabled={loading}

            />

          </div>

 

          {/* Dugme za registraciju */}

          <Button

            type="submit"

            className="w-full"

            disabled={loading}

          >

            {loading ? 'Registracija...' : 'Registruj se'}

          </Button>

 

          {/* Link za prijavu */}

          <div className="text-center">

            <span className="text-sm text-gray-600">

              Već imate nalog?{' '}

              <Link

                href="/login"

                className="font-medium text-blue-600 hover:text-blue-500"

              >

                Prijavite se

              </Link>

            </span>

          </div>

        </form>

      </div>

    </div>

  );

};

 

export default RegisterPage;