'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type Tab = 'users' | 'locations' | 'reviews';
type Row = Record<string, unknown>;

const ID_KEY: Record<Tab, string> = {
  users: 'user_id',
  locations: 'location_id',
  reviews: 'review_id',
};

const TABS: { key: Tab; label: string }[] = [
  { key: 'users', label: 'Utilisateurs' },
  { key: 'locations', label: 'Lieux' },
  { key: 'reviews', label: 'Avis' },
];

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>('users');
  const [data, setData] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/admin/${activeTab}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const result: Row[] = await res.json();
        if (!cancelled) {
          setData(result);
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setData([]);
          setError('Impossible de charger les données.');
        }
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  const handleDelete = async (id: string) => {
    if (!confirm('Confirmer la suppression ?')) return;

    const res = await fetch(`/api/admin/${activeTab}/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      setError('La suppression a échoué.');
      return;
    }

    setData((prev) => prev.filter((item) => String(item[ID_KEY[activeTab]]) !== id));
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 space-y-2 border-r bg-muted/40 p-4">
        {TABS.map(({ key, label }) => (
          <Button
            key={key}
            variant={activeTab === key ? 'default' : 'ghost'}
            disabled={activeTab === key}
            onClick={() => setActiveTab(key)}
            className="w-full justify-start"
          >
            {label}
          </Button>
        ))}
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto p-6">
        <h1 className="mb-4 text-2xl font-bold capitalize">Gestion des {activeTab}</h1>

        {error && <p className="mb-4 text-destructive">{error}</p>}

        {data.length === 0 ? (
          <p className="text-muted-foreground">Aucune donnée à afficher.</p>
        ) : (
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {Object.keys(data[0]).map((key) => (
                    <TableHead key={key} className="capitalize">
                      {key.replace('_', ' ')}
                    </TableHead>
                  ))}
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item) => {
                  const id = String(item[ID_KEY[activeTab]]);
                  return (
                    <TableRow key={id}>
                      {Object.values(item).map((value, idx) => (
                        <TableCell key={idx}>
                          {typeof value === 'string' && value.length > 100
                            ? value.slice(0, 100) + '...'
                            : value?.toString()}
                        </TableCell>
                      ))}
                      <TableCell>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(id)}>
                          Supprimer
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
    </div>
  );
}
