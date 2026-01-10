import React from 'react';
import { User } from 'lucide-react';
import { cn } from '../../lib/utils';
import { getInitials } from '../../lib/utils';

interface AvatarProps {
  src?: string;
  firstName?: string;
  lastName?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  online?: boolean;
  className?: string;
}

export default function Avatar({
  src,
  firstName = '',
  lastName = '',
  size = 'md',
  online = false,
  className,
}: AvatarProps) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  };

  const initials = getInitials(firstName, lastName);

  return (
    <div className={cn('relative inline-block', className)}>
      <div
        className={cn(
          'rounded-full flex items-center justify-center font-semibold overflow-hidden',
          'bg-gradient-to-br from-primary-400 to-primary-600 text-white',
          sizes[size]
        )}
      >
        {src ? (
          <img src={src} alt={`${firstName} ${lastName}`} className="w-full h-full object-cover" />
        ) : initials ? (
          <span>{initials}</span>
        ) : (
          <User size={size === 'sm' ? 16 : size === 'md' ? 20 : 24} />
        )}
      </div>
      {online && (
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
      )}
    </div>
  );
}