'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Plus } from 'lucide-react';
import AddLocationModal from './AddLocationModal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

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
      <aside className="w-full border-t p-4 lg:w-[400px] lg:border-t-0 lg:border-l">
        <div className="mb-4 flex items-center gap-2">
          <Input
            type="text"
            placeholder="Rechercher un lieu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          {session && (
            <Button
              size="icon"
              onClick={() => setShowForm(true)}
              title="Ajouter un lieu"
              aria-label="Ajouter un lieu"
            >
              <Plus />
            </Button>
          )}
        </div>

        <ul className="space-y-1">
          {filtered.map((loc) => (
            <li key={loc.id}>
              <button
                onClick={() => onSelect(loc.id)}
                className="w-full cursor-pointer rounded-md p-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
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
