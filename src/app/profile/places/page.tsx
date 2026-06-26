import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function UserPlaces() {
  const session = await auth();
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
      <h2 className="mb-6 text-2xl font-bold">Mes lieux</h2>

      {locations.length === 0 ? (
        <p className="text-muted-foreground italic">Aucun lieu n&apos;a encore été ajouté.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {locations.map((location) => (
            <Card key={location.location_id}>
              <CardHeader>
                <CardTitle className="text-lg">{location.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {location.address}, {location.city} {location.zip_code}
                </p>
                <p className="mt-2 text-right text-xs text-muted-foreground">
                  Ajouté le {new Date(location.created_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
