import { prisma } from '@/lib/prisma';
import { NextResponse, NextRequest } from 'next/server';

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const id = context.params.id;

  const location = await prisma.location.findUnique({
    where: { location_id: id },
  });

  if (!location) {
    return NextResponse.json({ error: 'Lieu non trouvé' }, { status: 404 });
  }

  return NextResponse.json(location);
}

export async function PUT(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const data = await req.json();
  const id = context.params.id;

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

export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const id = context.params.id;

  await prisma.location.delete({
    where: { location_id: id },
  });

  return NextResponse.json({ message: 'Lieu supprimé' });
}
