import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/requireAdmin';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  const { id } = await params;

  const review = await prisma.review.findUnique({ where: { review_id: id } });
  if (!review) {
    return NextResponse.json({ error: 'Avis non trouvé' }, { status: 404 });
  }

  await prisma.review.delete({ where: { review_id: id } });

  return NextResponse.json({ message: 'Avis supprimé' });
}
