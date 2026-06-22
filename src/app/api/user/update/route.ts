// app/api/user/update/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { pseudo, email } = await req.json();

  try {
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { pseudo, email },
    });

    return NextResponse.json({ message: 'Profil mis à jour', user: updatedUser });
  } catch (e) {
    logger.error(e);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
