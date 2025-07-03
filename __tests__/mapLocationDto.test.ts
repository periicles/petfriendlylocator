import { mapLocationToDTO, mapLocationsToDTO } from '@/utils/mapLocationDto';
import { Location } from '@prisma/client';
import { describe, it, expect } from '@jest/globals';

const mockLocation: Location = {
  location_id: 'loc_123',
  name: 'Parc Bordelais',
  description: 'Un grand parc pour les chiens',
  address: 'Rue du Parc',
  zip_code: 33000,
  city: 'Bordeaux',
  latitude: '44.8487',
  longitude: '-0.595',
  created_at: new Date('2024-01-01T10:00:00Z'),
  updated_at: new Date('2024-06-01T12:00:00Z'),
  user_id: 'user_abc',
  location_type: 'PARK', // Enum attendu par Prisma
};

describe('mapLocationToDTO', () => {
  it('should map a Location to LocationDTO correctly', () => {
    const dto = mapLocationToDTO(mockLocation);

    expect(dto).toEqual({
      location_id: 'loc_123',
      name: 'Parc Bordelais',
      description: 'Un grand parc pour les chiens',
      address: 'Rue du Parc',
      zip_code: 33000,
      city: 'Bordeaux',
      latitude: '44.8487',
      longitude: '-0.595',
      created_at: '2024-01-01T10:00:00.000Z',
      updated_at: '2024-06-01T12:00:00.000Z',
      user_id: 'user_abc',
    });
  });

  it('should handle null values correctly', () => {
    const partialLocation = {
      ...mockLocation,
      description: null,
      updated_at: null,
      user_id: null,
    };

    const dto = mapLocationToDTO(partialLocation);

    expect(dto.description).toBeNull();
    expect(dto.updated_at).toBeNull();
    expect(dto.user_id).toBeNull();
  });
});

describe('mapLocationsToDTO', () => {
  it('should map an array of Locations to LocationDTOs', () => {
    const dtos = mapLocationsToDTO([mockLocation, mockLocation]);
    expect(dtos).toHaveLength(2);
    expect(dtos[0].location_id).toBe('loc_123');
  });
});
