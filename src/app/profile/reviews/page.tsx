import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function UserReviews() {
  const session = await auth();
  const email = session?.user?.email;

  if (!email) return <p>Non connecté</p>;

  const user = await prisma.user.findUnique({
    where: { email },
    select: { user_id: true },
  });

  if (!user) return <p>Utilisateur introuvable</p>;

  const reviews = await prisma.review.findMany({
    where: { user_id: user.user_id },
    include: { location: true },
  });

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Mes avis</h2>

      {reviews.length === 0 ? (
        <p className="text-muted-foreground italic">Aucun avis n&apos;a encore été publié.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <Card key={review.review_id}>
              <CardHeader>
                <CardTitle className="text-lg">{review.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground italic">&quot;{review.content}&quot;</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Note : {review.rating}/5 • Lieu : {review.location.name}
                </p>
                <p className="mt-2 text-right text-xs text-muted-foreground">
                  Publié le {new Date(review.created_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
