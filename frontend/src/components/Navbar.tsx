'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          Socioptic
        </Link>
        <div className="space-x-4">
          {user ? (
            <>
              <Link href="/posts" className="hover:text-gray-300">
                내 포스트
              </Link>
              <button onClick={logout} className="hover:text-gray-300">
                로그아웃
              </button>
            </>
          ) : (
            <Link href="/" className="hover:text-gray-300">
              로그인
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
