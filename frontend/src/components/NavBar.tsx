'use client';

 

import React from 'react';

import { useAuth } from '../context/AuthContext';

import { useRouter } from 'next/navigation';

import {

  ChatBubbleLeftRightIcon,

  UserCircleIcon,

  ArrowRightOnRectangleIcon,

} from '@heroicons/react/24/outline';

 

const Navbar: React.FC = () => {

  const { user, logout } = useAuth();

  const router = useRouter();

 

  const handleLogout = async () => {

    await logout();

  };

 

  return (

    <nav className="bg-blue-600 text-white shadow-lg">

      <div className="container mx-auto px-4">

        <div className="flex justify-between items-center h-16">

          {/* Logo i naziv aplikacije */}

          <div

            className="flex items-center space-x-2 cursor-pointer"

            onClick={() => router.push('/')}

          >

            <ChatBubbleLeftRightIcon className="h-8 w-8" />

            <span className="text-xl font-bold">Chat Aplikacija</span>

          </div>

 

          {/* Korisničke opcije */}

          {user && (

            <div className="flex items-center space-x-4">

              {/* Prikaz imena korisnika */}

              <div className="flex items-center space-x-2">

                <UserCircleIcon className="h-6 w-6" />

                <span className="hidden md:inline">

                  {user.firstName} {user.lastName}

                </span>

                {user.role === 'admin' && (

                  <span className="bg-yellow-500 text-xs px-2 py-1 rounded-full">

                    Admin

                  </span>

                )}

                {user.role === 'moderator' && (

                  <span className="bg-green-500 text-xs px-2 py-1 rounded-full">

                    Moderator

                  </span>

                )}

              </div>

 

              {/* Dugme za odjavu */}

              <button

                onClick={handleLogout}

                className="flex items-center space-x-1 hover:bg-blue-700 px-3 py-2 rounded-lg transition-colors"

              >

                <ArrowRightOnRectangleIcon className="h-5 w-5" />

                <span className="hidden md:inline">Odjavi se</span>

              </button>

            </div>

          )}

        </div>

      </div>

    </nav>

  );

};

 

export default Navbar;