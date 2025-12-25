import React from 'react';

 

interface CardProps {

  children: React.ReactNode;

  className?: string;

  onClick?: () => void;

}

 

const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {

  return (

    <div

      className={`bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200 ${

        onClick ? 'cursor-pointer' : ''

      } ${className}`}

      onClick={onClick}

    >

      {children}

    </div>

  );

};

 

export default Card;