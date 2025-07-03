import { beforeAll, afterAll, describe, it, expect } from '@jest/globals';
import { POST, GET } from '@/app/api/locations/route';
import { PrismaClient } from '@prisma/client';
import { NextRequest } from 'next/server';
import { jest } from '@jest/globals';

jest.mock('next-auth/jwt', () => ({
  getToken: jest.fn(() => Promise.resolve({ sub: 'user_mocked_id' })),
}));

const prisma = new PrismaClient();

beforeAll(async () => {
  process.env.DATABASE_URL = 'file:./test.db?mode=memory&cache=shared';
  await prisma.$connect();
  await prisma.user.create({
    data: {
      user_id: 'user_mocked_id',
      pseudo: 'testUser',
      email: 'test@example.com',
      password: 'hashed',
    },
  });
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('App Router - /api/locations integration', () => {
  it('should POST and GET a location', async () => {
    const body = {
      name: 'Parc Bordelais',
      description: 'Test parc',
      address: 'Rue du Parc',
      zip_code: 33000,
      city: 'Bordeaux',
      latitude: '44.8487',
      longitude: '-0.595',
      location_type: 'PARK',
    };

    const postRequest = new Request('http://localhost/api/locations', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    }) as unknown as NextRequest;

    const postRes = await POST(postRequest);
    expect(postRes.status).toBe(201);
    const postData = await postRes.json();
    expect(postData.name).toBe('Parc Bordelais');

    const getRes = await GET();
    expect(getRes.status).toBe(200);
    const getData = await getRes.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(getData.some((l: any) => l.name === 'Parc Bordelais')).toBe(true);
  });
});
