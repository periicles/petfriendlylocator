import 'dotenv/config';
import { PrismaClient, type LocationType, type UserRole } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { hash } from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const BCRYPT_ROUNDS = 10;

// Deterministic UUIDs keep the seed fully idempotent: re-running upserts the
// same rows instead of appending duplicates. `kind` namespaces each entity.
const id = (kind: number, n: number): string =>
  `${kind.toString().padStart(8, '0')}-0000-0000-0000-${n.toString().padStart(12, '0')}`;

const userId = (n: number) => id(0, n);
const locationId = (n: number) => id(1, n);
const reviewId = (n: number) => id(2, n);

type SeedUser = {
  user_id: string;
  pseudo: string;
  email: string;
  password: string;
  roles: UserRole;
};

type LocationCatalogEntry = {
  name: string;
  description: string;
  address: string;
  zip_code: number;
  city: string;
  latitude: string;
  longitude: string;
  location_type: LocationType;
};

const members = [
  'Member',
  'Camille',
  'Lucas',
  'Inès',
  'Hugo',
  'Léa',
] as const;

// Curated, plausible pet-friendly spots around the Bordeaux metropolitan area.
const catalog: LocationCatalogEntry[] = [
  { name: 'Parc Bordelais', description: 'Un grand parc ombragé pour chiens et enfants.', address: 'Rue du Bocage', zip_code: 33000, city: 'Bordeaux', latitude: '44.8520', longitude: '-0.5950', location_type: 'PARK' },
  { name: 'Jardin Public', description: 'Jardin à l’anglaise, chiens tenus en laisse.', address: 'Cours de Verdun', zip_code: 33000, city: 'Bordeaux', latitude: '44.8487', longitude: '-0.5760', location_type: 'PARK' },
  { name: 'Parc aux Angéliques', description: 'Vaste parc rive droite le long de la Garonne.', address: 'Quai des Queyries', zip_code: 33100, city: 'Bordeaux', latitude: '44.8485', longitude: '-0.5560', location_type: 'PARK' },
  { name: 'Parc de Majolan', description: 'Parc romantique avec lac et grottes, à Blanquefort.', address: 'Avenue de Majolan', zip_code: 33290, city: 'Blanquefort', latitude: '44.9080', longitude: '-0.6390', location_type: 'PARK' },
  { name: 'Plage du Lac', description: 'Zone de baignade pour chiens surveillée l’été.', address: 'Avenue du Lac', zip_code: 33300, city: 'Bordeaux', latitude: '44.8850', longitude: '-0.5672', location_type: 'BEACH' },
  { name: 'Plage de la Garonne — Lormont', description: 'Berges aménagées, accès chiens autorisé.', address: 'Quai Numa Sensine', zip_code: 33310, city: 'Lormont', latitude: '44.8760', longitude: '-0.5240', location_type: 'BEACH' },
  { name: 'Dog Café Bordeaux', description: 'Un café accueillant les chiens avec friandises canines.', address: '12 rue des Faussets', zip_code: 33000, city: 'Bordeaux', latitude: '44.8378', longitude: '-0.5792', location_type: 'RESTAURANT' },
  { name: 'Le Bistrot des Pattes', description: 'Bistrot de quartier, gamelle d’eau à l’entrée.', address: '8 rue Saint-James', zip_code: 33000, city: 'Bordeaux', latitude: '44.8369', longitude: '-0.5708', location_type: 'RESTAURANT' },
  { name: 'Brasserie du Marché', description: 'Terrasse spacieuse, animaux bienvenus.', address: 'Place des Capucins', zip_code: 33800, city: 'Bordeaux', latitude: '44.8290', longitude: '-0.5650', location_type: 'RESTAURANT' },
  { name: 'Café Canin de Pessac', description: 'Salon de thé pet-friendly avec coin chiens.', address: '24 avenue Jean Jaurès', zip_code: 33600, city: 'Pessac', latitude: '44.8060', longitude: '-0.6310', location_type: 'RESTAURANT' },
  { name: 'Animalerie des Quais', description: 'Boutique spécialisée, animaux bienvenus en laisse.', address: '5 quai de Bacalan', zip_code: 33300, city: 'Bordeaux', latitude: '44.8617', longitude: '-0.5556', location_type: 'SHOP' },
  { name: 'Boutique Truffe & Co', description: 'Accessoires et toilettage, accueil des chiens.', address: '40 rue Sainte-Catherine', zip_code: 33000, city: 'Bordeaux', latitude: '44.8400', longitude: '-0.5730', location_type: 'SHOP' },
  { name: 'Jardinerie de Mérignac', description: 'Grande surface jardin, animaux acceptés.', address: 'Avenue de la Somme', zip_code: 33700, city: 'Mérignac', latitude: '44.8390', longitude: '-0.6450', location_type: 'SHOP' },
  { name: 'Hôtel des Pattes', description: 'Hôtel acceptant les animaux sans supplément.', address: '20 cours de l’Intendance', zip_code: 33000, city: 'Bordeaux', latitude: '44.8425', longitude: '-0.5746', location_type: 'HOTEL' },
  { name: 'Hôtel du Parc', description: 'Chambres pet-friendly proches du Jardin Public.', address: '15 rue du Palais Gallien', zip_code: 33000, city: 'Bordeaux', latitude: '44.8460', longitude: '-0.5810', location_type: 'HOTEL' },
  { name: 'Auberge des Vignes', description: 'Auberge de campagne accueillant les animaux.', address: 'Route de Saint-Émilion', zip_code: 33330, city: 'Saint-Émilion', latitude: '44.8930', longitude: '-0.1550', location_type: 'HOTEL' },
  { name: 'Berges de la Garonne', description: 'Promenade le long du fleuve, idéale pour les balades.', address: 'Quai des Queyries', zip_code: 33100, city: 'Bordeaux', latitude: '44.8470', longitude: '-0.5566', location_type: 'OTHER' },
  { name: 'Esplanade des Quinconces', description: 'Grande place arborée en centre-ville.', address: 'Place des Quinconces', zip_code: 33000, city: 'Bordeaux', latitude: '44.8440', longitude: '-0.5740', location_type: 'OTHER' },
  { name: 'Domaine de la Burthe', description: 'Parc forestier avec sentiers, à Floirac.', address: 'Rue de la Burthe', zip_code: 33270, city: 'Floirac', latitude: '44.8350', longitude: '-0.5230', location_type: 'PARK' },
  { name: 'Bois de Thouars', description: 'Espace boisé pour promenades canines, à Talence.', address: 'Avenue de Thouars', zip_code: 33400, city: 'Talence', latitude: '44.8030', longitude: '-0.5870', location_type: 'PARK' },
];

// Short, varied review templates paired with their rating.
const reviewTemplates: { rating: number; title: string; content: string }[] = [
  { rating: 5, title: 'Parfait pour mon chien', content: 'Beaucoup d’espace et d’ombre, mon labrador adore.' },
  { rating: 5, title: 'On y revient', content: 'Endroit propre et vraiment accueillant pour les animaux.' },
  { rating: 4, title: 'Accueil chaleureux', content: 'Personnel adorable et gamelle d’eau fournie.' },
  { rating: 4, title: 'Très agréable', content: 'Bonne expérience, un peu fréquenté le week-end.' },
  { rating: 3, title: 'Correct', content: 'Sympa mais l’accès chien n’est pas toujours évident.' },
];

async function upsertUser({ password, ...user }: SeedUser) {
  const hashedPassword = await hash(password, BCRYPT_ROUNDS);
  return prisma.user.upsert({
    where: { user_id: user.user_id },
    update: { pseudo: user.pseudo, roles: user.roles },
    create: { ...user, password: hashedPassword },
  });
}

async function main() {
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'admin123';
  const memberPassword = process.env.SEED_MEMBER_PASSWORD ?? 'member123';

  await upsertUser({
    user_id: userId(0),
    pseudo: 'Admin',
    email: 'admin@pfb.fr',
    password: adminPassword,
    roles: 'ADMIN',
  });

  // Member user_ids start at 1; index aligns with the `members` array.
  for (const [i, pseudo] of members.entries()) {
    const n = i + 1;
    await upsertUser({
      user_id: userId(n),
      pseudo,
      email: `${pseudo.toLowerCase()}@pfb.fr`,
      password: memberPassword,
      roles: 'USER',
    });
  }

  const memberUserIds = members.map((_, i) => userId(i + 1));

  for (const [i, entry] of catalog.entries()) {
    const data = {
      location_id: locationId(i + 1),
      ...entry,
      // Round-robin ownership across members (admin owns the first few).
      user_id: i < 3 ? userId(0) : memberUserIds[i % memberUserIds.length],
    };
    await prisma.location.upsert({
      where: { location_id: data.location_id },
      update: data,
      create: data,
    });
  }

  // Deterministically attach 0–3 reviews per location from the template pool.
  let reviewCounter = 0;
  for (const [i] of catalog.entries()) {
    const count = i % 4; // 0,1,2,3,0,1,2,3,...
    for (let r = 0; r < count; r++) {
      reviewCounter += 1;
      const template = reviewTemplates[(i + r) % reviewTemplates.length];
      const data = {
        review_id: reviewId(reviewCounter),
        rating: template.rating,
        title: template.title,
        content: template.content,
        location_id: locationId(i + 1),
        // Reviewer is anyone but the owner, picked deterministically.
        user_id: memberUserIds[(i + r + 1) % memberUserIds.length],
      };
      await prisma.review.upsert({
        where: { review_id: data.review_id },
        update: data,
        create: data,
      });
    }
  }

  console.log(
    `✅ Seed terminé : ${members.length + 1} utilisateurs, ${catalog.length} lieux, ${reviewCounter} avis.`,
  );
}

main()
  .catch((e) => {
    console.error('❌ Erreur dans le seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
