import { prisma } from '@/lib/prisma';
import { NextResponse, NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import type { TCreateLocationInput } from '@/types/createLocationInput';
import type { LocationDTO } from '@/types/locationDto';
import { mapLocationsToDTO } from '@/utils/mapLocationDto';
import { LocationType } from '@prisma/client';

export async function GET() {
  const locations = await prisma.location.findMany();
  return NextResponse.json(mapLocationsToDTO(locations));
}

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const userId = session.user.id;

  const body: TCreateLocationInput = await req.json();

  if (!Object.values(LocationType).includes(body.location_type as LocationType)) {
    return NextResponse.json({ error: 'Type de lieu invalide' }, { status: 400 });
  }

  const prismaResult = await prisma.location.create({
    data: {
      ...body,
      location_type: body.location_type as LocationType,
      user_id: userId,
    },
  });

  const [newLocation]: LocationDTO[] = mapLocationsToDTO([prismaResult]);

  return NextResponse.json(newLocation, { status: 201 });
}
