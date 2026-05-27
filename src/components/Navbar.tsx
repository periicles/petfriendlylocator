'use client';

import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isMounted, setIsMounted] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setIsMounted(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!isMounted || status === 'loading') return null;

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="fixed top-0 z-50 w-full bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <h1 className="text-lg md:text-xl font-bold text-gray-800">Pet Friendly Locator</h1>

        <div className="flex space-x-4 text-sm md:text-base">
          <Link
            href="/"
            className={
              isActive('/') ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-500'
            }
          >
            Accueil
          </Link>
          <Link
            href="/carte"
            className={
              isActive('/carte')
                ? 'text-blue-600 font-semibold'
                : 'text-gray-700 hover:text-blue-500'
            }
          >
            Carte
          </Link>

          {session?.user ? (
            <>
              <Link
                href="/profile"
                className={
                  isActive('/profile')
                    ? 'text-blue-600 font-semibold'
                    : 'text-gray-700 hover:text-blue-500'
                }
              >
                Profil
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="text-gray-700 hover:text-red-500 cursor-pointer"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className={
                isActive('/login')
                  ? 'text-blue-600 font-semibold'
                  : 'text-gray-700 hover:text-blue-500'
              }
            >
              Connexion
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
