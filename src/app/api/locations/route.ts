import { prisma } from '@/lib/prisma';
import { NextResponse, NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { CreateLocationInput } from '@/types/createLocationInput';
import type { LocationDTO } from '@/types/locationDto';
import { mapLocationsToDTO } from '@/utils/mapLocationDto';
import { LocationType } from '@prisma/client';

export async function GET() {
  const locations = await prisma.location.findMany();
  return NextResponse.json(mapLocationsToDTO(locations));
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req });

  if (!token || !token.sub) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const userId = token.sub;

  const body: CreateLocationInput = await req.json();

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
