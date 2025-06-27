'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
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
            href="/locations"
            className={
              isActive('/locations')
                ? 'text-blue-600 font-semibold'
                : 'text-gray-700 hover:text-blue-500'
            }
          >
            Carte
          </Link>
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
        </div>
      </div>
    </nav>
  );
}
