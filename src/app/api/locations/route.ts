import { prisma } from '@/lib/prisma';
import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import type { CreateLocationInput } from '@/types/createLocationInput';
import type { LocationDTO } from '@/types/locationDto';
import { mapLocationsToDTO } from '@/utils/mapLocationDto';

export async function GET() {
  const locations = await prisma.location.findMany();
  return NextResponse.json(mapLocationsToDTO(locations));
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const body: CreateLocationInput = await req.json();

  const prismaResult = await prisma.location.create({
    data: {
      ...body,
      user_id: session.user.id,
    },
  });

  const [newLocation]: LocationDTO[] = mapLocationsToDTO([prismaResult]);

  return NextResponse.json(newLocation, { status: 201 });
}
