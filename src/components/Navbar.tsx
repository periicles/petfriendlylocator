'use client';

import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

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

  const linkClass = (active: boolean) =>
    cn(
      'text-sm transition-colors md:text-base',
      active ? 'font-semibold text-foreground' : 'text-muted-foreground hover:text-foreground'
    );

  return (
    <nav className="fixed top-0 z-50 w-full border-b bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <h1 className="text-lg font-bold md:text-xl">Pet Friendly Locator</h1>

        <div className="flex items-center gap-4">
          <Link href="/" className={linkClass(isActive('/'))}>
            Accueil
          </Link>
          <Link href="/carte" className={linkClass(isActive('/carte'))}>
            Carte
          </Link>

          {session?.user ? (
            <>
              <Link href="/profile" className={linkClass(isActive('/profile'))}>
                Profil
              </Link>
              <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: '/login' })}>
                Déconnexion
              </Button>
            </>
          ) : (
            <Link href="/login" className={linkClass(isActive('/login'))}>
              Connexion
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
