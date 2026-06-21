'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import LocationSidebar from './LocationsSidebar';
import LocationDetailPanel from './LocationDetailPanel';
import type { LocationDTO } from '@/types/locationDto';

const Map = dynamic(() => import('@/components/Map'), { ssr: false });

export type Location = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
};

export default function LocationsView() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchLocations = async () => {
    try {
      const res = await fetch('/api/locations');
      const data: LocationDTO[] = await res.json();
      setLocations(
        data.map((loc) => ({
          id: loc.location_id,
          name: loc.name,
          latitude: Number(loc.latitude),
          longitude: Number(loc.longitude),
        }))
      );
    } catch {
      setLocations([]);
    }
  };

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    fetchLocations();
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)]">
      <div className="flex-1 h-full">
        <Map locations={locations} onSelectLocation={setSelectedId} />
      </div>
      {selectedId ? (
        <LocationDetailPanel locationId={selectedId} onClose={() => setSelectedId(null)} />
      ) : (
        <LocationSidebar
          locations={locations}
          refreshLocations={fetchLocations}
          onSelect={setSelectedId}
        />
      )}
    </div>
  );
}
