'use client';

import dynamic from 'next/dynamic';
import LocationSidebar from './LocationsSidebar';

const Map = dynamic(() => import('@/components/Map'), { ssr: false });

export default function LocationsView() {
  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)]">
      <div className="flex-1">
        <Map />
      </div>
      <LocationSidebar />
    </div>
  );
}
