import { describe, it, expect, jest, beforeEach } from '@jest/globals';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findMany: jest.fn(), findUnique: jest.fn(), delete: jest.fn() },
    location: { findMany: jest.fn(), findUnique: jest.fn(), delete: jest.fn() },
    review: { findMany: jest.fn(), findUnique: jest.fn(), delete: jest.fn(), deleteMany: jest.fn() },
    $transaction: jest.fn(),
  },
}));

jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
}));

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';
import { GET as getUsers } from '@/app/api/admin/users/route';
import { GET as getLocations } from '@/app/api/admin/locations/route';
import { GET as getReviews } from '@/app/api/admin/reviews/route';
import { DELETE as deleteUser } from '@/app/api/admin/users/[id]/route';
import { DELETE as deleteLocation } from '@/app/api/admin/locations/[id]/route';
import { DELETE as deleteReview } from '@/app/api/admin/reviews/[id]/route';

const mockAuth = auth as jest.MockedFunction<any>;
const req = () => new Request('http://localhost/api/admin') as unknown as NextRequest;
const params = (id: string) => ({ params: Promise.resolve({ id }) });

beforeEach(() => {
  jest.clearAllMocks();
});

describe('admin route guards', () => {
  it('returns 401 when unauthenticated', async () => {
    mockAuth.mockResolvedValueOnce(null);
    const res = await getUsers(req());
    expect(res.status).toBe(401);
  });

  it('returns 403 when authenticated but not admin', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: 'u1', roles: 'USER' } });
    const res = await getUsers(req());
    expect(res.status).toBe(403);
  });
});

describe('GET admin lists (as admin)', () => {
  beforeEach(() => mockAuth.mockResolvedValue({ user: { id: 'admin1', roles: 'ADMIN' } }));

  it('lists users without exposing passwords', async () => {
    (prisma.user.findMany as jest.MockedFunction<any>).mockResolvedValueOnce([
      { user_id: 'u1', pseudo: 'Alice', email: 'a@b.c', roles: 'USER', created_at: new Date() },
    ]);
    const res = await getUsers(req());
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data[0]).not.toHaveProperty('password');
    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ select: expect.not.objectContaining({ password: true }) })
    );
  });

  it('lists locations', async () => {
    (prisma.location.findMany as jest.MockedFunction<any>).mockResolvedValueOnce([]);
    const res = await getLocations(req());
    expect(res.status).toBe(200);
  });

  it('lists reviews', async () => {
    (prisma.review.findMany as jest.MockedFunction<any>).mockResolvedValueOnce([]);
    const res = await getReviews(req());
    expect(res.status).toBe(200);
  });
});

describe('DELETE admin resources (as admin)', () => {
  beforeEach(() => mockAuth.mockResolvedValue({ user: { id: 'admin1', roles: 'ADMIN' } }));

  it('404 when user does not exist', async () => {
    (prisma.user.findUnique as jest.MockedFunction<any>).mockResolvedValueOnce(null);
    const res = await deleteUser(req(), params('missing'));
    expect(res.status).toBe(404);
  });

  it('deletes an existing user', async () => {
    (prisma.user.findUnique as jest.MockedFunction<any>).mockResolvedValueOnce({ user_id: 'u1' });
    (prisma.user.delete as jest.MockedFunction<any>).mockResolvedValueOnce({});
    const res = await deleteUser(req(), params('u1'));
    expect(res.status).toBe(200);
    expect(prisma.user.delete).toHaveBeenCalledWith({ where: { user_id: 'u1' } });
  });

  it('deletes a location and its reviews in a transaction', async () => {
    (prisma.location.findUnique as jest.MockedFunction<any>).mockResolvedValueOnce({
      location_id: 'loc1',
    });
    (prisma.$transaction as jest.MockedFunction<any>).mockResolvedValueOnce([]);
    const res = await deleteLocation(req(), params('loc1'));
    expect(res.status).toBe(200);
    expect(prisma.review.deleteMany).toHaveBeenCalledWith({ where: { location_id: 'loc1' } });
    expect(prisma.$transaction).toHaveBeenCalled();
  });

  it('deletes a review', async () => {
    (prisma.review.findUnique as jest.MockedFunction<any>).mockResolvedValueOnce({
      review_id: 'r1',
    });
    (prisma.review.delete as jest.MockedFunction<any>).mockResolvedValueOnce({});
    const res = await deleteReview(req(), params('r1'));
    expect(res.status).toBe(200);
    expect(prisma.review.delete).toHaveBeenCalledWith({ where: { review_id: 'r1' } });
  });
});
