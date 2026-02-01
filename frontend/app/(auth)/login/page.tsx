
import React from 'react';
import LoginForm from 'components/forms/LoginForm';
import { Metadata } from 'next';
import 'tailwindcss';


export const metadata: Metadata = {
  title: 'Prijava | Chat App',
  description: 'Prijavite se na Chat aplikaciju',
};

export default function LoginPage() {
  return <LoginForm />;
}