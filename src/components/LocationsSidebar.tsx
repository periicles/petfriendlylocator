'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import AddIcon from '@mui/icons-material/Add';
import AddLocationModal from './AddLocationModal';

type SidebarLocation = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
};

type Props = {
  locations: SidebarLocation[];
  refreshLocations: () => void;
  // eslint-disable-next-line no-unused-vars
  onSelect: (id: string) => void;
};

export default function LocationSidebar({ locations, refreshLocations, onSelect }: Props) {
  const { data: session } = useSession();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

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
              title="Ajouter un lieu"
              className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition cursor-pointer"
            >
              <AddIcon />
            </button>
          )}
        </div>

        <ul className="space-y-2">
          {filtered.map((loc) => (
            <li key={loc.id}>
              <button
                onClick={() => onSelect(loc.id)}
                className="w-full text-left p-2 rounded hover:bg-gray-100 cursor-pointer"
              >
                {loc.name}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {showForm && (
        <AddLocationModal
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            refreshLocations();
          }}
        />
      )}
    </>
  );
}
