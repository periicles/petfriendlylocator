import { Location } from '@prisma/client';
import { LocationDTO } from '@/types/locationDto';

export function mapLocationToDTO(location: Location): LocationDTO {
  return {
    location_id: location.location_id,
    name: location.name,
    description: location.description ?? null,
    address: location.address,
    zip_code: location.zip_code,
    city: location.city,
    latitude: location.latitude,
    longitude: location.longitude,
    created_at: location.created_at.toISOString(),
    updated_at: location.updated_at ? location.updated_at.toISOString() : null,
    user_id: location.user_id ?? null,
  };
}

export function mapLocationsToDTO(locations: Location[]): LocationDTO[] {
  return locations.map(mapLocationToDTO);
}
