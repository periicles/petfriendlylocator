'use client';

import { useState, useEffect } from 'react';

export default function UserProfile() {
  const [pseudo, setPseudo] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch('/api/user/me');
      if (res.ok) {
        const data = await res.json();
        setPseudo(data.pseudo);
        setEmail(data.email);
      } else {
        setMessage('Erreur lors du chargement des données utilisateur');
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch('/api/user/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pseudo, email }),
    });

    if (res.ok) {
      setMessage('Profil mis à jour avec succès !');
    } else {
      const error = await res.json();
      setMessage(`Erreur : ${error.error || 'mise à jour impossible'}`);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto bg-[var(--vintage-beige)]">
      <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--vintage-black)' }}>
        Votre profil
      </h2>
      <p className="text-sm mb-6" style={{ color: 'var(--vintage-taupe)' }}>
        Mettez à jour vos informations personnelles.
      </p>

      {loading ? (
        <p className="text-gray-500 italic">Chargement...</p>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-xl p-6 space-y-4">
          <div>
            <label
              htmlFor="pseudo"
              className="block text-sm mb-1"
              style={{ color: 'var(--vintage-black)' }}
            >
              Pseudo
            </label>
            <input
              id="pseudo"
              type="text"
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Jean Dupont"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm mb-1"
              style={{ color: 'var(--vintage-black)' }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="jean@example.com"
            />
          </div>
          <button
            type="submit"
            className="bg-[var(--vintage-taupe)] text-white py-2 px-4 rounded hover:opacity-90 transition cursor-pointer"
          >
            Enregistrer les modifications
          </button>
          {message && (
            <p className="text-sm mt-2" style={{ color: 'var(--vintage-black)' }}>
              {message}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
