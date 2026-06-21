'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import CloseIcon from '@mui/icons-material/Close';
import type { LocationDTO } from '@/types/locationDto';
import type { ReviewDTO } from '@/types/reviewDto';

type Props = {
  locationId: string;
  onClose: () => void;
};

const RATINGS = [1, 2, 3, 4, 5];

export default function LocationDetailPanel({ locationId, onClose }: Props) {
  const { data: session } = useSession();

  const [location, setLocation] = useState<LocationDTO | null>(null);
  const [reviews, setReviews] = useState<ReviewDTO[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadDetails = useCallback(async () => {
    try {
      const [locRes, revRes] = await Promise.all([
        fetch(`/api/locations/${locationId}`),
        fetch(`/api/locations/${locationId}/reviews`),
      ]);
      if (!locRes.ok) throw new Error('location');
      setLocation(await locRes.json());
      setReviews(revRes.ok ? await revRes.json() : []);
      setLoadError(null);
    } catch {
      setLoadError('Impossible de charger ce lieu.');
    }
  }, [locationId]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    loadDetails();
  }, [loadDetails]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    try {
      const res = await fetch(`/api/locations/${locationId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, title, content }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? 'La publication a échoué.');
      }

      const created: ReviewDTO = await res.json();
      setReviews((prev) => [created, ...prev]);
      setTitle('');
      setContent('');
      setRating(5);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'La publication a échoué.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <aside className="w-full lg:w-[400px] border-t lg:border-t-0 lg:border-l border-gray-200 p-4 overflow-y-auto">
      <div className="flex items-start justify-between mb-4">
        <h2 className="text-xl font-bold">{location?.name ?? 'Chargement…'}</h2>
        <button onClick={onClose} title="Fermer" className="text-gray-500 hover:text-gray-800">
          <CloseIcon />
        </button>
      </div>

      {loadError && <p className="text-red-600">{loadError}</p>}

      {location && (
        <div className="space-y-1 text-sm text-gray-700 mb-6">
          {location.description && <p>{location.description}</p>}
          <p>
            {location.address}, {location.zip_code} {location.city}
          </p>
          <p className="uppercase text-xs tracking-wide text-gray-500">{location.location_type}</p>
        </div>
      )}

      <section>
        <h3 className="font-semibold mb-2">Avis ({reviews.length})</h3>

        {reviews.length === 0 ? (
          <p className="italic text-gray-500 text-sm">Aucun avis pour le moment.</p>
        ) : (
          <ul className="space-y-3">
            {reviews.map((review) => (
              <li key={review.review_id} className="rounded border border-gray-200 p-3">
                <div className="flex justify-between">
                  <span className="font-medium">{review.title}</span>
                  <span className="text-sm text-gray-600">{review.rating}/5</span>
                </div>
                <p className="text-sm text-gray-700 mt-1">{review.content}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {review.author ?? 'Anonyme'} • {new Date(review.created_at).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {session ? (
        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <h3 className="font-semibold">Laisser un avis</h3>

          <label className="block text-sm">
            Note
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="block w-full border border-gray-300 rounded px-2 py-1 mt-1"
            >
              {RATINGS.map((n) => (
                <option key={n} value={n}>
                  {n}/5
                </option>
              ))}
            </select>
          </label>

          <input
            type="text"
            placeholder="Titre"
            value={title}
            required
            onChange={(e) => setTitle(e.target.value)}
            className="block w-full border border-gray-300 rounded px-2 py-1"
          />

          <textarea
            placeholder="Votre avis"
            value={content}
            required
            rows={3}
            onChange={(e) => setContent(e.target.value)}
            className="block w-full border border-gray-300 rounded px-2 py-1"
          />

          {formError && <p className="text-red-600 text-sm">{formError}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-60"
          >
            {submitting ? 'Publication…' : 'Publier'}
          </button>
        </form>
      ) : (
        <p className="mt-6 text-sm text-gray-500">Connectez-vous pour laisser un avis.</p>
      )}
    </aside>
  );
}
