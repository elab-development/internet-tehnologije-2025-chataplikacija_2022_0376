import React from 'react';

 

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {

  variant?: 'primary' | 'secondary' | 'danger';

  size?: 'sm' | 'md' | 'lg';

  children: React.ReactNode;

}

 

const Button: React.FC<ButtonProps> = ({

  variant = 'primary',

  size = 'md',

  children,

  className = '',

  ...props

}) => {

  const baseClasses = 'font-medium rounded-lg transition-colors duration-200 disabled:opacity-50';

 

  const variantClasses = {

    primary: 'bg-blue-600 hover:bg-blue-700 text-white',

    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',

    danger: 'bg-red-600 hover:bg-red-700 text-white',

  };

 

  const sizeClasses = {

    sm: 'px-3 py-1.5 text-sm',

    md: 'px-4 py-2 text-base',

    lg: 'px-6 py-3 text-lg',

  };

 

  return (

    <button

      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}

      {...props}

    >

      {children}

    </button>

  );

};

 

export default Button;

 



