'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { X } from 'lucide-react';
import type { LocationDTO } from '@/types/locationDto';
import type { ReviewDTO } from '@/types/reviewDto';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Props = {
  locationId: string;
  onClose: () => void;
};

const RATINGS = [
  { value: '1', label: '1/5' },
  { value: '2', label: '2/5' },
  { value: '3', label: '3/5' },
  { value: '4', label: '4/5' },
  { value: '5', label: '5/5' },
];
const RATING_ITEMS = RATINGS.map((n) => ({ value: n, label: `${n}/5` }));

export default function LocationDetailPanel({ locationId, onClose }: Props) {
  const { data: session } = useSession();

  const [location, setLocation] = useState<LocationDTO | null>(null);
  const [reviews, setReviews] = useState<ReviewDTO[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [rating, setRating] = useState('5');
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
        body: JSON.stringify({ rating: Number(rating), title, content }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? 'La publication a échoué.');
      }

      const created: ReviewDTO = await res.json();
      setReviews((prev) => [created, ...prev]);
      setTitle('');
      setContent('');
      setRating('5');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'La publication a échoué.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <aside className="w-full overflow-y-auto border-t p-4 lg:w-[400px] lg:border-t-0 lg:border-l">
      <div className="mb-4 flex items-start justify-between">
        <h2 className="text-xl font-semibold">{location?.name ?? 'Chargement…'}</h2>
        <Button variant="ghost" size="icon-sm" onClick={onClose} title="Fermer" aria-label="Fermer">
          <X />
        </Button>
      </div>

      {loadError && <p className="text-destructive">{loadError}</p>}

      {location && (
        <div className="mb-6 space-y-2 text-sm text-muted-foreground">
          {location.description && <p>{location.description}</p>}
          <p>
            {location.address}, {location.zip_code} {location.city}
          </p>
          <Badge variant="secondary">{location.location_type}</Badge>
        </div>
      )}

      <section>
        <h3 className="mb-2 font-medium">Avis ({reviews.length})</h3>

        {reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">Aucun avis pour le moment.</p>
        ) : (
          <ul className="space-y-3">
            {reviews.map((review) => (
              <li key={review.review_id} className="rounded-lg border p-3">
                <div className="flex justify-between">
                  <span className="font-medium">{review.title}</span>
                  <span className="text-sm text-muted-foreground">{review.rating}/5</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{review.content}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {review.author ?? 'Anonyme'} • {new Date(review.created_at).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {session ? (
        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <h3 className="font-medium">Laisser un avis</h3>

          <div className="space-y-2">
            <Label>Note</Label>
            <Select
              value={rating}
              onValueChange={(value) => setRating(value ?? '5')}
              items={RATING_ITEMS}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RATINGS.map((n) => (
                  <SelectItem key={n.value} value={n.value}>
                    {n.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Input
            type="text"
            placeholder="Titre"
            value={title}
            required
            onChange={(e) => setTitle(e.target.value)}
          />

          <Textarea
            placeholder="Votre avis"
            value={content}
            required
            rows={3}
            onChange={(e) => setContent(e.target.value)}
          />

          {formError && <p className="text-sm text-destructive">{formError}</p>}

          <Button type="submit" disabled={submitting}>
            {submitting ? 'Publication…' : 'Publier'}
          </Button>
        </form>
      ) : (
        <p className="mt-6 text-sm text-muted-foreground">Connectez-vous pour laisser un avis.</p>
      )}
    </aside>
  );
}
