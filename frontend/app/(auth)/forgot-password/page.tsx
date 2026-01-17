import React from 'react';
import ForgotPasswordForm from 'components/forms/ForgotPassword';
import { Metadata } from 'next';
import 'tailwindcss';

export const metadata: Metadata = {
    title: 'Zaboravljena lozinka | Chat App',
    description: 'Resetujte vašu lozinku',
};

export default function ForgotPasswordPage() {
    return <ForgotPasswordForm />;
}