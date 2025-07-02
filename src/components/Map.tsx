'use client';

import mapboxgl from 'mapbox-gl';
import { useEffect, useRef } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

export default function Map() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  // 1. Initialisation de la carte
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-0.57918, 44.837789],
      zoom: 12,
    });

    return () => map.remove();
  }, []);
  return <div ref={mapContainer} className="w-full h-full min-h-[500px]" />;
}
