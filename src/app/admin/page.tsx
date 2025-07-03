'use client';

import { useEffect, useState } from 'react';

type Tab = 'users' | 'locations' | 'reviews';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>('users');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/admin/${activeTab}`);
        const result = await res.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching data:', error);
        setData([]);
      }
    };
    fetchData();
  }, [activeTab]);

  const handleEdit = (id: string) => {
    alert(`Éditer ${id}`);
    // future: open modal or redirect
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Confirmer la suppression ?')) return;

    await fetch(`/api/admin/${activeTab}/${id}`, {
      method: 'DELETE',
    });

    // Refresh list
    setData((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-100 border-r p-4 space-y-4">
        <button
          disabled={activeTab === 'users'}
          onClick={() => setActiveTab('users')}
          className={`w-full text-left px-4 py-2 rounded ${
            activeTab === 'users'
              ? 'bg-blue-600 text-white cursor-default'
              : 'bg-white hover:bg-gray-200'
          }`}
        >
          Utilisateurs
        </button>
        <button
          disabled={activeTab === 'locations'}
          onClick={() => setActiveTab('locations')}
          className={`w-full text-left px-4 py-2 rounded ${
            activeTab === 'locations'
              ? 'bg-blue-600 text-white cursor-default'
              : 'bg-white hover:bg-gray-200'
          }`}
        >
          Lieux
        </button>
        <button
          disabled={activeTab === 'reviews'}
          onClick={() => setActiveTab('reviews')}
          className={`w-full text-left px-4 py-2 rounded ${
            activeTab === 'reviews'
              ? 'bg-blue-600 text-white cursor-default'
              : 'bg-white hover:bg-gray-200'
          }`}
        >
          Avis
        </button>
      </aside>

      {/* Content */}
      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-2xl font-bold capitalize mb-4">Gestion des {activeTab}</h1>

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
              {data.map((item) => (
                <tr key={item.id || item.user_id || item.location_id || item.review_id}>
                  {Object.values(item).map((value, idx) => (
                    <td key={idx} className="p-2 border-b">
                      {typeof value === 'string' && value.length > 100
                        ? value.slice(0, 100) + '...'
                        : value?.toString()}
                    </td>
                  ))}
                  <td className="p-2 border-b space-x-2">
                    <button
                      onClick={() => handleEdit(item.id || item.user_id)}
                      className="text-sm px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    >
                      Éditer
                    </button>
                    <button
                      onClick={() => handleDelete(item.id || item.user_id)}
                      className="text-sm px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
}
