'use client';

import { useEffect, useState } from 'react';

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
      <aside className="w-64 bg-gray-100 border-r p-4 space-y-4">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            disabled={activeTab === key}
            onClick={() => setActiveTab(key)}
            className={`w-full text-left px-4 py-2 rounded ${
              activeTab === key
                ? 'bg-blue-600 text-white cursor-default'
                : 'bg-white hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </aside>

      {/* Content */}
      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-2xl font-bold capitalize mb-4">Gestion des {activeTab}</h1>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        {data.length === 0 ? (
          <p className="text-gray-500">Aucune donnée à afficher.</p>
        ) : (
          <table className="w-full border border-gray-300 text-sm">
            <thead className="bg-gray-100">
              <tr>
                {Object.keys(data[0]).map((key) => (
                  <th key={key} className="text-left p-2 border-b capitalize">
                    {key.replace('_', ' ')}
                  </th>
                ))}
                <th className="p-2 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => {
                const id = String(item[ID_KEY[activeTab]]);
                return (
                  <tr key={id}>
                    {Object.values(item).map((value, idx) => (
                      <td key={idx} className="p-2 border-b">
                        {typeof value === 'string' && value.length > 100
                          ? value.slice(0, 100) + '...'
                          : value?.toString()}
                      </td>
                    ))}
                    <td className="p-2 border-b">
                      <button
                        onClick={() => handleDelete(id)}
                        className="text-sm px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}
