'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import AddIcon from '@mui/icons-material/Add';
import AddLocationModal from './AddLocationModal';

type SidebarLocation = {
  id: string;
  name: string;
};

export default function LocationSidebar() {
  const { data: session } = useSession();

  const [locations, setLocations] = useState<SidebarLocation[]>([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Récupération des lieux depuis l’API
  const fetchLocations = async () => {
    try {
      const res = await fetch('/api/locations');
      const data = await res.json();
      setLocations(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data.map((loc: any) => ({
          id: loc.location_id,
          name: loc.name,
        }))
      );
    } catch (err) {
      console.error('Erreur chargement des lieux:', err);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const filtered = locations.filter((loc) => loc.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <aside className="w-full lg:w-[400px] border-t lg:border-t-0 lg:border-l border-gray-200 p-4">
        <div className="flex items-center mb-4 gap-2">
          <input
            type="text"
            placeholder="Rechercher un lieu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border border-gray-300 rounded px-2 py-1"
          />
          {session && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
            >
              <AddIcon />
            </button>
          )}
        </div>

        <ul className="space-y-2">
          {filtered.map((loc) => (
            <li key={loc.id} className="p-2 rounded hover:bg-gray-100 cursor-pointer">
              {loc.name}
            </li>
          ))}
        </ul>
      </aside>

      {showForm && (
        <AddLocationModal
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            fetchLocations();
          }}
        />
      )}
    </>
  );
}
