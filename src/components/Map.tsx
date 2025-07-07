'use client';

import mapboxgl from 'mapbox-gl';
import { useEffect, useRef } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Location } from './LocationsView';

type MapProps = {
  locations: Location[];
};

export default function Map({ locations }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]); // pour nettoyer

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-0.57918, 44.837789],
      zoom: 12,
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null; // 👈 important pour autoriser une remount
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // si la carte est déjà chargée
    if (map.loaded()) {
      updateMarkers();
    } else {
      map.on('load', updateMarkers);
    }

    function updateMarkers() {
      const map = mapRef.current!;
      // nettoie les anciens marqueurs
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      locations.forEach((loc) => {
        const marker = new mapboxgl.Marker()
          .setLngLat([loc.longitude, loc.latitude])
          .setPopup(new mapboxgl.Popup().setText(loc.name))
          .addTo(map);

        markersRef.current.push(marker);
      });
    }

    // cleanup si locations change
    return () => {
      map.off('load', updateMarkers);
    };
  }, [locations]);

  return <div ref={mapContainer} className="w-full h-full min-h-[500px]" />;
}
