import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';

export async function GET() {
  const users = await prisma.user.findMany({
    select: {
      user_id: true,
      email: true,
      pseudo: true,
      created_at: true,
    },
  });

  return NextResponse.json(users);
}

export async function POST(req: Request) {
  const { email, password, pseudo } = await req.json();

  if (!email || !password || !pseudo) {
    return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
  }

  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { pseudo }],
    },
  });

  if (existing) {
    return NextResponse.json({ error: 'Email ou pseudo déjà utilisé' }, { status: 409 });
  }

  const hashedPassword = await hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      pseudo,
    },
    select: {
      user_id: true,
      email: true,
      pseudo: true,
      created_at: true,
    },
  });

  return NextResponse.json(user, { status: 201 });
}
