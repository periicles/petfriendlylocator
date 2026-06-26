'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

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
    <div className="mx-auto max-w-3xl p-8">
      <h2 className="mb-2 text-2xl font-bold">Votre profil</h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Mettez à jour vos informations personnelles.
      </p>

      {loading ? (
        <p className="text-muted-foreground italic">Chargement...</p>
      ) : (
        <Card>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pseudo">Pseudo</Label>
                <Input
                  id="pseudo"
                  type="text"
                  value={pseudo}
                  onChange={(e) => setPseudo(e.target.value)}
                  placeholder="Jean Dupont"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jean@example.com"
                />
              </div>
              <Button type="submit">Enregistrer les modifications</Button>
              {message && <p className="text-sm text-muted-foreground">{message}</p>}
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
