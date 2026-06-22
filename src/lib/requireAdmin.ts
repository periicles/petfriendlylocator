import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from './auth';

/**
 * Guard for admin-only route handlers. Returns a ready-to-send error response
 * when the caller is not an authenticated admin, or `null` when access is
 * granted: `const denied = await requireAdmin(); if (denied) return denied;`.
 *
 * `_req` is accepted but unused — v5 `auth()` reads the request context itself;
 * the parameter is kept for call-site compatibility with the admin routes.
 */
export async function requireAdmin(_req?: NextRequest): Promise<NextResponse | null> {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  if (session.user.roles !== 'ADMIN') {
    return NextResponse.json({ error: 'Accès interdit' }, { status: 403 });
  }

  return null;
}
