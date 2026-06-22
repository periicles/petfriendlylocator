import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const location = await prisma.location.findUnique({
    where: { location_id: id },
  });

  if (!location) {
    return NextResponse.json({ error: 'Lieu non trouvé' }, { status: 404 });
  }

  return NextResponse.json(location);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { id } = await params;

  const location = await prisma.location.findUnique({ where: { location_id: id } });
  if (!location) {
    return NextResponse.json({ error: 'Lieu non trouvé' }, { status: 404 });
  }
  if (location.user_id !== session.user.id) {
    return NextResponse.json({ error: 'Accès interdit' }, { status: 403 });
  }

  const data = await req.json();

  const updated = await prisma.location.update({
    where: { location_id: id },
    data: {
      name: data.name,
      description: data.description,
      address: data.address,
      zip_code: data.zip_code,
      city: data.city,
      latitude: data.latitude,
      longitude: data.longitude,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { id } = await params;

  const location = await prisma.location.findUnique({ where: { location_id: id } });
  if (!location) {
    return NextResponse.json({ error: 'Lieu non trouvé' }, { status: 404 });
  }
  if (location.user_id !== session.user.id) {
    return NextResponse.json({ error: 'Accès interdit' }, { status: 403 });
  }

  await prisma.location.delete({ where: { location_id: id } });

  return NextResponse.json({ message: 'Lieu supprimé' });
}
