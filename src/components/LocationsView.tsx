'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import LocationSidebar from './LocationsSidebar';

const Map = dynamic(() => import('@/components/Map'), { ssr: false });

export type Location = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
};

export default function LocationsView() {
  const [locations, setLocations] = useState<Location[]>([]);

  const fetchLocations = async () => {
    try {
      const res = await fetch('/api/locations');
      const data = await res.json();
      setLocations(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data.map((loc: any) => ({
          id: loc.location_id,
          name: loc.name,
          latitude: loc.latitude,
          longitude: loc.longitude,
        }))
      );
    } catch (err) {
      console.error('Erreur chargement des lieux:', err);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)]">
      <div className="flex-1 h-full">
        <Map locations={locations} />
      </div>
      <LocationSidebar locations={locations} refreshLocations={fetchLocations} />
    </div>
  );
}
