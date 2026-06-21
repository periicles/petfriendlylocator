import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/requireAdmin';

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  const locations = await prisma.location.findMany({
    orderBy: { created_at: 'desc' },
  });

  return NextResponse.json(locations);
}
