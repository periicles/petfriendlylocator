import { describe, it, expect, jest } from '@jest/globals';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    location: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('next-auth/jwt', () => ({
  getToken: jest.fn(),
}));

import { POST, GET } from '@/app/api/locations/route';
import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';

const mockGetToken = getToken as jest.MockedFunction<any>;

const mockFindMany = prisma.location.findMany as jest.MockedFunction<any>;

const mockCreate = prisma.location.create as jest.MockedFunction<any>;

const mockLocationRecord = {
  location_id: 'loc_123',
  name: 'Parc Bordelais',
  description: 'Test parc',
  address: 'Rue du Parc',
  zip_code: 33000,
  city: 'Bordeaux',
  latitude: '44.8487',
  longitude: '-0.595',
  created_at: new Date('2024-01-01'),
  updated_at: null,
  user_id: 'user_mocked_id',
  location_type: 'PARK' as const,
};

describe('GET /api/locations', () => {
  it('returns 200 with mapped locations', async () => {
    mockFindMany.mockResolvedValueOnce([mockLocationRecord]);

    const res = await GET();

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveLength(1);
    expect(data[0].name).toBe('Parc Bordelais');
  });

  it('returns empty array when no locations exist', async () => {
    mockFindMany.mockResolvedValueOnce([]);

    const res = await GET();

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual([]);
  });
});

describe('POST /api/locations', () => {
  it('returns 401 when not authenticated', async () => {
    mockGetToken.mockResolvedValueOnce(null);

    const req = new Request('http://localhost/api/locations', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test' }),
      headers: { 'Content-Type': 'application/json' },
    }) as unknown as NextRequest;

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('returns 201 with the created location', async () => {
    mockGetToken.mockResolvedValueOnce({ sub: 'user_mocked_id' });
    mockCreate.mockResolvedValueOnce(mockLocationRecord);

    const req = new Request('http://localhost/api/locations', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Parc Bordelais',
        description: 'Test parc',
        address: 'Rue du Parc',
        zip_code: 33000,
        city: 'Bordeaux',
        latitude: '44.8487',
        longitude: '-0.595',
        location_type: 'PARK',
      }),
      headers: { 'Content-Type': 'application/json' },
    }) as unknown as NextRequest;

    const res = await POST(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.name).toBe('Parc Bordelais');
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ user_id: 'user_mocked_id', location_type: 'PARK' }),
      })
    );
  });
});
