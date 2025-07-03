import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { type: string; id: string } }
) {
  const { type, id } = params;

  try {
    switch (type) {
      case 'users':
        await prisma.user.delete({ where: { user_id: id } });
        break;
      case 'locations':
        await prisma.location.delete({ where: { location_id: id } });
        break;
      case 'reviews':
        await prisma.review.delete({ where: { review_id: id } });
        break;
      default:
        return NextResponse.json({ error: 'Type non reconnu' }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    void error;
    return NextResponse.json({ error: 'Erreur lors de la suppression: ' }, { status: 500 });
  }
}
