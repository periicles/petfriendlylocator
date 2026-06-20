import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/requireAdmin';

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  const reviews = await prisma.review.findMany({
    orderBy: { created_at: 'desc' },
  });

  return NextResponse.json(reviews);
}
