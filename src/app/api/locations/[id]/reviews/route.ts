import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { mapReviewsToDTO, mapReviewToDTO, type ReviewWithAuthor } from '@/utils/mapReviewDto';

const RATING_MIN = 1;
const RATING_MAX = 5;

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // The Accelerate extension drops the `include` relation from findMany's
  // return type (create infers it correctly); the row carries `user` at runtime.
  const reviews = (await prisma.review.findMany({
    where: { location_id: id },
    include: { user: { select: { pseudo: true } } },
    orderBy: { created_at: 'desc' },
  })) as ReviewWithAuthor[];

  return NextResponse.json(mapReviewsToDTO(reviews));
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { id } = await params;

  const body = await req.json().catch(() => null);
  const rating = Number(body?.rating);
  const title = typeof body?.title === 'string' ? body.title.trim() : '';
  const content = typeof body?.content === 'string' ? body.content.trim() : '';

  if (!Number.isInteger(rating) || rating < RATING_MIN || rating > RATING_MAX) {
    return NextResponse.json(
      { error: `La note doit être un entier entre ${RATING_MIN} et ${RATING_MAX}.` },
      { status: 400 }
    );
  }
  if (!title || !content) {
    return NextResponse.json(
      { error: 'Le titre et le contenu sont obligatoires.' },
      { status: 400 }
    );
  }

  const location = await prisma.location.findUnique({ where: { location_id: id } });
  if (!location) {
    return NextResponse.json({ error: 'Lieu non trouvé' }, { status: 404 });
  }

  const review = await prisma.review.create({
    data: { rating, title, content, location_id: id, user_id: session.user.id },
    include: { user: { select: { pseudo: true } } },
  });

  return NextResponse.json(mapReviewToDTO(review), { status: 201 });
}
