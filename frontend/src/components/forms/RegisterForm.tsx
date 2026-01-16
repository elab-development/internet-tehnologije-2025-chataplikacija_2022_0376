'use client';

import React, { useState } from 'react';
import { Mail, Lock, User } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { isValidEmail, isValidPassword } from '@/lib/utils';

interface RegisterFormProps {
  onSubmit: (email: string, password: string, username: string) => Promise<void>;
  error?: string;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit, error: externalError }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!isValidPassword(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters with uppercase, lowercase, and number';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await onSubmit(formData.email, formData.password, formData.username);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {externalError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {externalError}
        </div>
      )}

      <Input
        type="text"
        label="Username"
        placeholder="Choose a username"
        value={formData.username}
        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
        icon={<User className="h-5 w-5 text-gray-400" />}
        error={errors.username}
        disabled={loading}
        required
      />

      <Input
        type="email"
        label="Email Address"
        placeholder="you@example.com"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        icon={<Mail className="h-5 w-5 text-gray-400" />}
        error={errors.email}
        disabled={loading}
        required
      />

      <Input
        type="password"
        label="Password"
        placeholder="Create a strong password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        icon={<Lock className="h-5 w-5 text-gray-400" />}
        error={errors.password}
        disabled={loading}
        required
      />

      <Input
        type="password"
        label="Confirm Password"
        placeholder="Re-enter your password"
        value={formData.confirmPassword}
        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
        icon={<Lock className="h-5 w-5 text-gray-400" />}
        error={errors.confirmPassword}
        disabled={loading}
        required
      />

      <Button type="submit" fullWidth loading={loading}>
        Create Account
      </Button>
    </form>
  );
};