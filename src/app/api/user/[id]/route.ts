import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const user = await prisma.user.findUnique({
    where: { user_id: params.id },
    select: {
      user_id: true,
      email: true,
      pseudo: true,
      created_at: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const data = await req.json();

  if (data.password) {
    return NextResponse.json(
      { error: 'Changement de mot de passe non autorisé ici' },
      { status: 400 }
    );
  }

  const user = await prisma.user.update({
    where: { user_id: params.id },
    data: {
      email: data.email,
      pseudo: data.pseudo,
    },
    select: {
      user_id: true,
      email: true,
      pseudo: true,
      created_at: true,
    },
  });

  return NextResponse.json(user);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.user.delete({
    where: { user_id: params.id },
  });

  return NextResponse.json({ message: 'Utilisateur supprimé' });
}
