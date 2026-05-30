import { Location } from '@prisma/client';
import { LocationDTO } from '@/types/locationDto';

/**
 * Convert a Prisma `Location` row into the public `LocationDTO`.
 *
 * Why a separate DTO instead of returning the raw Prisma model:
 *   - decouples the API contract from the DB schema (renaming a column
 *     should not silently break consumers);
 *   - serialises `Date` fields to ISO strings (Prisma returns `Date` objects,
 *     which would be coerced inconsistently across runtimes);
 *   - normalises optional FKs / nullable columns to explicit `null`.
 */
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
    location_type: location.location_type,
  };
}

export function mapLocationsToDTO(locations: Location[]): LocationDTO[] {
  return locations.map(mapLocationToDTO);
}
