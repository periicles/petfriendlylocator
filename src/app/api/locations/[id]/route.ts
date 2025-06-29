import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const location = await prisma.location.findUnique({
    where: { location_id: params.id },
  });

  if (!location) return NextResponse.json({ error: 'Lieu non trouvé' }, { status: 404 });

  return NextResponse.json(location);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const data = await req.json();

  const updated = await prisma.location.update({
    where: { location_id: params.id },
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

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.location.delete({
    where: { location_id: params.id },
  });

  return NextResponse.json({ message: 'Lieu supprimé' });
}
