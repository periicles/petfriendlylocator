'use client';

import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        callbackUrl: '/',
        redirect: false,
      });

      if (result?.ok) {
        window.location.href = result.url || '/';
      } else if (result?.error) {
        setError('Identifiants incorrects');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Une erreur est survenue lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--vintage-beige)] px-4">
      <div className="w-full max-w-sm bg-[var(--vintage-light)] text-[var(--vintage-black)] rounded-xl shadow-lg p-6 text-center">
        {/* Logo ou icône */}
        <div className="mb-4">
          <Image src="/PFB.png" alt="Logo" width={64} height={64} className="mx-auto" priority />
        </div>

        <h2 className="text-xl font-bold mb-6">Connexion</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        <input
          type="email"
          placeholder="Adresse email"
          className="w-full mb-4 px-3 py-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-[var(--vintage-taupe)]"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />

        <input
          type="password"
          placeholder="Mot de passe"
          className="w-full mb-4 px-3 py-2 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-[var(--vintage-taupe)]"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
        />

        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full bg-[var(--vintage-black)] text-white py-2 rounded-md font-semibold hover:opacity-90 transition disabled:opacity-50"
        >
          {isLoading ? 'Connexion...' : 'Se connecter'}
        </button>

        <div className="flex justify-between text-sm mt-4 text-[var(--vintage-taupe)]">
          <Link href="/forgot-password" className="hover:underline">
            Mot de passe oublié ?
          </Link>
          <Link href="/register" className="hover:underline">
            Créer un compte
          </Link>
        </div>
      </div>
    </div>
  );
}
