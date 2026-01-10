import React from 'react';
import RegisterForm from 'components/forms/RegisterForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Registracija | Chat App',
  description: 'Kreirajte novi nalog',
};

export default function RegisterPage() {
  return <RegisterForm />;
}