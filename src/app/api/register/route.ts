import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { email, password, pseudo } = await req.json();

    if (!email || !password || !pseudo) {
      return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email déjà utilisé' }, { status: 409 });
    }

    const existingPseudo = await prisma.user.findUnique({ where: { pseudo } });
    if (existingPseudo) {
      return NextResponse.json({ error: 'Pseudo déjà utilisé' }, { status: 409 });
    }

    const hashedPassword = await hash(password, 10);

    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        pseudo,
      },
    });

    return NextResponse.json({ message: 'Utilisateur créé avec succès' }, { status: 201 });
  } catch (error) {
    console.error('Erreur d’inscription:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
