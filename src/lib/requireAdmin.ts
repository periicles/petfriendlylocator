import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Guard for admin-only route handlers.
 *
 * Returns a ready-to-send error response when the caller is not an
 * authenticated admin, or `null` when access is granted — letting the route
 * short-circuit with `const denied = await requireAdmin(req); if (denied) return denied;`.
 */
export async function requireAdmin(req: NextRequest): Promise<NextResponse | null> {
  const token = await getToken({ req });

  if (!token?.sub) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  if (token.roles !== 'ADMIN') {
    return NextResponse.json({ error: 'Accès interdit' }, { status: 403 });
  }

  return null;
}
