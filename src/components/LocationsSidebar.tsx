'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import AddIcon from '@mui/icons-material/Add';

const dummyLocations = [
  { id: 1, name: 'Parc Bordelais' },
  { id: 2, name: 'Place des Quinconces' },
  { id: 3, name: 'Jardin Public' },
];

export default function LocationSidebar() {
  const { data: session } = useSession();
  const [search, setSearch] = useState('');

  const filtered = dummyLocations.filter((loc) =>
    loc.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
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
          <button className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
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
  );
}
