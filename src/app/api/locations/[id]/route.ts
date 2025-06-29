import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// Optional helper type for clarity
type RouteContext = { params: Record<string, string> };

export async function GET(req: NextRequest, { params }: RouteContext) {
  const id = params.id;

  const location = await prisma.location.findUnique({
    where: { location_id: id },
  });

  if (!location) {
    return NextResponse.json({ error: 'Lieu non trouvé' }, { status: 404 });
  }

  return NextResponse.json(location);
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  const data = await req.json();
  const id = params.id;

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

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const id = params.id;

  await prisma.location.delete({
    where: { location_id: id },
  });

  return NextResponse.json({ message: 'Lieu supprimé' });
}
