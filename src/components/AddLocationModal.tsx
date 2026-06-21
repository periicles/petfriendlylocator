'use client';

import { TCreateLocationInput } from '@/types/createLocationInput';
import { useEffect, useState } from 'react';

type Props = {
  onClose: () => void;
  onSuccess?: () => void;
};

/** Subset of the Mapbox Geocoding v5 feature shape consumed here. */
type GeocodingContext = { id: string; text: string };
type GeocodingFeature = {
  id: string;
  text: string;
  place_name: string;
  center: [number, number];
  context?: GeocodingContext[];
};

export default function AddLocationModal({ onClose, onSuccess }: Props) {
  const [form, setForm] = useState<TCreateLocationInput>({
    name: '',
    description: '',
    address: '',
    zip_code: 0,
    city: '',
    latitude: '',
    longitude: '',
    location_type: 'OTHER',
  });

  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<GeocodingFeature[]>([]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (search.length < 3) {
        setSuggestions([]);
        return;
      }

      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(search)}.json?autocomplete=true&limit=5&access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`
      );
      const data: { features?: GeocodingFeature[] } = await res.json();
      setSuggestions(data.features ?? []);
    };

    const timeout = setTimeout(fetchSuggestions, 300); // debounce
    return () => clearTimeout(timeout);
  }, [search]);

  const handleSuggestionClick = (feature: GeocodingFeature) => {
    const [lng, lat] = feature.center;
    const context = feature.context ?? [];

    const postcode = context.find((c) => c.id.startsWith('postcode'))?.text ?? '';
    const city = context.find((c) => c.id.startsWith('place'))?.text ?? '';

    setForm({
      ...form,
      address: feature.text,
      city: city,
      zip_code: Number(postcode) || 0,
      latitude: lat.toString(),
      longitude: lng.toString(),
    });

    setSearch(feature.place_name);
    setSuggestions([]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch('/api/locations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        ...form,
        zip_code: Number(form.zip_code),
      }),
    });

    if (res.ok) {
      onSuccess?.();
      onClose();
    } else {
      alert("Erreur lors de l'ajout");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-lg border border-gray-300">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Ajouter un lieu</h2>

        <form onSubmit={handleSubmit} className="space-y-4 text-gray-800 relative">
          <input
            type="text"
            name="name"
            placeholder="Nom du lieu"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-gray-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher une adresse..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-400 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {suggestions.length > 0 && (
              <ul className="absolute z-50 bg-white border border-gray-300 rounded mt-1 w-full max-h-48 overflow-y-auto shadow-lg">
                {suggestions.map((sugg) => (
                  <li
                    key={sugg.id}
                    onClick={() => handleSuggestionClick(sugg)}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                  >
                    {sugg.place_name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <input
            type="text"
            name="address"
            placeholder="Adresse"
            value={form.address}
            readOnly
            className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
          />

          <div className="flex gap-2">
            <input
              type="text"
              name="city"
              placeholder="Ville"
              value={form.city}
              readOnly
              className="flex-1 border border-gray-300 rounded px-3 py-2 bg-gray-100"
            />
            <input
              type="text"
              name="zip_code"
              placeholder="Code postal"
              value={String(form.zip_code)}
              readOnly
              className="w-32 border border-gray-300 rounded px-3 py-2 bg-gray-100"
            />
            <select
              name="location_type"
              value={form.location_type}
              onChange={handleChange}
              className="w-full border border-gray-400 bg-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">-- Type de lieu --</option>
              <option value="PARK">Parc</option>
              <option value="BEACH">Plage</option>
              <option value="RESTAURANT">Restaurant</option>
              <option value="SHOP">Boutique</option>
              <option value="HOTEL">Hôtel</option>
              <option value="OTHER">Autre</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
