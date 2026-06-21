import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { hash } from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const hashedPassword = await hash('admin123', 10);

  // Idempotent: safe to run repeatedly (e.g. after migrate dev).
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@pfb.fr' },
    update: {},
    create: {
      pseudo: 'Admin',
      email: 'admin@pfb.fr',
      password: hashedPassword,
      roles: 'ADMIN',
    },
  });

  if ((await prisma.location.count()) === 0) {
    await prisma.location.createMany({
      data: [
        {
          name: 'Parc Bordelais',
          description: 'Un grand parc ombragé pour chiens et enfants.',
          address: 'Rue du Parc, Bordeaux',
          zip_code: 33000,
          city: 'Bordeaux',
          latitude: '44.8520',
          longitude: '-0.5950',
          user_id: adminUser.user_id,
          location_type: 'PARK',
        },
        {
          name: 'Dog Café Bordeaux',
          description: 'Un café accueillant les chiens avec friandises canines.',
          address: '12 rue des Chiens, Bordeaux',
          zip_code: 33000,
          city: 'Bordeaux',
          latitude: '44.8378',
          longitude: '-0.5792',
          user_id: adminUser.user_id,
          location_type: 'RESTAURANT',
        },
        {
          name: 'Plage du Lac',
          description: 'Zone de baignade pour chiens surveillée l’été.',
          address: 'Avenue du Lac, Bordeaux',
          zip_code: 33300,
          city: 'Bordeaux',
          latitude: '44.8850',
          longitude: '-0.5672',
          user_id: adminUser.user_id,
          location_type: 'BEACH',
        },
      ],
    });
  }
}

main()
  .catch((e) => {
    console.error('❌ Erreur dans le seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
