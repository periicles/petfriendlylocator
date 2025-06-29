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
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    name: '',
    address: '',
    city: '',
    zip_code: '',
    latitude: '',
    longitude: '',
  });

  const filtered = dummyLocations.filter((loc) =>
    loc.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch('/api/carte', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setShowForm(false);
      setForm({
        name: '',
        address: '',
        city: '',
        zip_code: '',
        latitude: '',
        longitude: '',
      });
    } else {
      alert('Erreur lors de l’ajout');
    }
  };

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
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-lg border border-gray-300">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Ajouter un lieu</h2>

            <form onSubmit={handleSubmit} className="space-y-4 text-gray-800">
              <input
                type="text"
                name="name"
                placeholder="Nom du lieu"
                value={form.name}
                onChange={handleChange}
                className="w-full border border-gray-400 bg-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="text"
                name="address"
                placeholder="Adresse"
                value={form.address}
                onChange={handleChange}
                className="w-full border border-gray-400 bg-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  name="city"
                  placeholder="Ville"
                  value={form.city}
                  onChange={handleChange}
                  className="flex-1 border border-gray-400 bg-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="text"
                  name="zip_code"
                  placeholder="Code postal"
                  value={form.zip_code}
                  onChange={handleChange}
                  className="w-32 border border-gray-400 bg-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="latitude"
                  placeholder="Latitude"
                  value={form.latitude}
                  onChange={handleChange}
                  className="flex-1 border border-gray-400 bg-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="text"
                  name="longitude"
                  placeholder="Longitude"
                  value={form.longitude}
                  onChange={handleChange}
                  className="flex-1 border border-gray-400 bg-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
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
      )}
    </>
  );
}
