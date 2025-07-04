import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function UserReviews() {
  const session = await getServerSession(authOptions);
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
      <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--vintage-black)' }}>
        Mes avis
      </h2>

      {reviews.length === 0 ? (
        <p className="italic text-gray-500">Aucun avis n&apos;a encore été publié.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <div
              key={review.review_id}
              className="rounded-xl shadow p-4"
              style={{
                backgroundColor: 'var(--vintage-beige)',
                color: 'var(--vintage-black)',
              }}
            >
              <h3 className="text-lg font-semibold">{review.title}</h3>
              <p className="text-sm italic text-gray-700">&quot;{review.content}&quot;</p>
              <p className="text-sm text-gray-600 mt-2">
                Note : {review.rating}/5 • Lieu : {review.location.name}
              </p>
              <p className="text-xs mt-2 text-right text-gray-500">
                Publié le {new Date(review.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
