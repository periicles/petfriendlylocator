'use client';

import { TCreateLocationInput } from '@/types/createLocationInput';
import { useEffect, useState } from 'react';
import { LocationType } from '@prisma/client';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

const LOCATION_TYPES: { value: LocationType; label: string }[] = [
  { value: 'PARK', label: 'Parc' },
  { value: 'BEACH', label: 'Plage' },
  { value: 'RESTAURANT', label: 'Restaurant' },
  { value: 'SHOP', label: 'Boutique' },
  { value: 'HOTEL', label: 'Hôtel' },
  { value: 'OTHER', label: 'Autre' },
];

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
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Ajouter un lieu</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du lieu</Label>
            <Input
              id="name"
              name="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="relative space-y-2">
            <Label htmlFor="address-search">Adresse</Label>
            <Input
              id="address-search"
              placeholder="Rechercher une adresse..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              required
            />
            {suggestions.length > 0 && (
              <ul className="absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-md border bg-popover shadow-md">
                {suggestions.map((sugg) => (
                  <li
                    key={sugg.id}
                    onClick={() => handleSuggestionClick(sugg)}
                    className="cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                  >
                    {sugg.place_name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="city">Ville</Label>
              <Input id="city" value={form.city} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip">Code postal</Label>
              <Input id="zip" value={String(form.zip_code)} readOnly />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Type de lieu</Label>
            <Select
              value={form.location_type}
              onValueChange={(value) => {
                if (value) setForm({ ...form, location_type: value as LocationType });
              }}
              items={LOCATION_TYPES}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="-- Type de lieu --" />
              </SelectTrigger>
              <SelectContent>
                {LOCATION_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">Enregistrer</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
