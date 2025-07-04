import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function UserPlaces() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  if (!email) return <p>Non connecté</p>;

  const user = await prisma.user.findUnique({
    where: { email },
    select: { user_id: true },
  });

  if (!user) return <p>Utilisateur introuvable</p>;

  const locations = await prisma.location.findMany({
    where: { user_id: user.user_id },
  });

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--vintage-black)' }}>
        Mes lieux
      </h2>

      {locations.length === 0 ? (
        <p className="italic text-gray-500">Aucun lieu n&apos;a encore été ajouté.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {locations.map((location) => (
            <div
              key={location.location_id}
              className="rounded-xl shadow p-4"
              style={{
                backgroundColor: 'var(--vintage-beige)',
                color: 'var(--vintage-black)',
              }}
            >
              <h3 className="text-lg font-semibold">{location.name}</h3>
              <p className="text-sm" style={{ color: 'var(--vintage-taupe)' }}>
                {location.address}, {location.city} {location.zip_code}
              </p>
              <p className="text-xs mt-2 text-right text-gray-500">
                Ajouté le {new Date(location.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
