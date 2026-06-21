import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/requireAdmin';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  const { id } = await params;

  const location = await prisma.location.findUnique({ where: { location_id: id } });
  if (!location) {
    return NextResponse.json({ error: 'Lieu non trouvé' }, { status: 404 });
  }

  // Reviews hold a required FK to Location, so they must go before the location.
  await prisma.$transaction([
    prisma.review.deleteMany({ where: { location_id: id } }),
    prisma.location.delete({ where: { location_id: id } }),
  ]);

  return NextResponse.json({ message: 'Lieu supprimé' });
}
