import { describe, it, expect, jest, beforeEach } from '@jest/globals';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    review: { findMany: jest.fn(), create: jest.fn() },
    location: { findUnique: jest.fn() },
  },
}));

jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
}));

import { GET, POST } from '@/app/api/locations/[id]/reviews/route';
import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const mockAuth = auth as jest.MockedFunction<any>;
const mockFindMany = prisma.review.findMany as jest.MockedFunction<any>;
const mockCreate = prisma.review.create as jest.MockedFunction<any>;
const mockLocationFindUnique = prisma.location.findUnique as jest.MockedFunction<any>;

const params = (id: string) => ({ params: Promise.resolve({ id }) });

const postReq = (body: unknown) =>
  new Request('http://localhost/api/locations/loc1/reviews', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  }) as unknown as NextRequest;

beforeEach(() => jest.clearAllMocks());

describe('GET /api/locations/[id]/reviews', () => {
  it('returns mapped reviews for the location', async () => {
    mockFindMany.mockResolvedValueOnce([
      {
        review_id: 'r1',
        rating: 5,
        title: 'Top',
        content: 'Génial',
        created_at: new Date('2024-01-01'),
        user_id: 'u1',
        location_id: 'loc1',
        user: { pseudo: 'Alice' },
      },
    ]);

    const res = await GET({} as NextRequest, params('loc1'));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data[0].author).toBe('Alice');
    expect(data[0]).not.toHaveProperty('user_id');
  });
});

describe('POST /api/locations/[id]/reviews', () => {
  it('returns 401 when unauthenticated', async () => {
    mockAuth.mockResolvedValueOnce(null);
    const res = await POST(postReq({ rating: 4, title: 'x', content: 'y' }), params('loc1'));
    expect(res.status).toBe(401);
  });

  it('returns 400 for an out-of-range rating', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: 'u1' } });
    const res = await POST(postReq({ rating: 9, title: 'x', content: 'y' }), params('loc1'));
    expect(res.status).toBe(400);
  });

  it('returns 400 when title or content is empty', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: 'u1' } });
    const res = await POST(postReq({ rating: 4, title: '   ', content: 'y' }), params('loc1'));
    expect(res.status).toBe(400);
  });

  it('returns 404 when the location does not exist', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: 'u1' } });
    mockLocationFindUnique.mockResolvedValueOnce(null);
    const res = await POST(postReq({ rating: 4, title: 'x', content: 'y' }), params('loc1'));
    expect(res.status).toBe(404);
  });

  it('creates a review and returns 201 with the DTO', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: 'u1' } });
    mockLocationFindUnique.mockResolvedValueOnce({ location_id: 'loc1' });
    mockCreate.mockResolvedValueOnce({
      review_id: 'r1',
      rating: 4,
      title: 'Bien',
      content: 'Sympa',
      created_at: new Date('2024-01-01'),
      user_id: 'u1',
      location_id: 'loc1',
      user: { pseudo: 'Alice' },
    });

    const res = await POST(postReq({ rating: 4, title: 'Bien', content: 'Sympa' }), params('loc1'));
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.author).toBe('Alice');
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ user_id: 'u1', location_id: 'loc1', rating: 4 }),
      })
    );
  });

  it('trims title and content before persisting', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: 'u1' } });
    mockLocationFindUnique.mockResolvedValueOnce({ location_id: 'loc1' });
    mockCreate.mockResolvedValueOnce({
      review_id: 'r1',
      rating: 4,
      title: 'Bien',
      content: 'Sympa',
      created_at: new Date('2024-01-01'),
      user_id: 'u1',
      location_id: 'loc1',
      user: { pseudo: 'Alice' },
    });

    await POST(postReq({ rating: 4, title: '  Bien  ', content: '  Sympa  ' }), params('loc1'));
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ title: 'Bien', content: 'Sympa' }),
      })
    );
  });
});
