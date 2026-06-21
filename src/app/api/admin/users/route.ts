import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/requireAdmin';

export async function GET(req: NextRequest) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  const users = await prisma.user.findMany({
    select: {
      user_id: true,
      pseudo: true,
      email: true,
      roles: true,
      created_at: true,
    },
    orderBy: { created_at: 'desc' },
  });

  return NextResponse.json(users);
}
