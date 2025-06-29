import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    // Rediriger côté serveur
    return <p>Accès refusé</p>;
  }

  const { user } = session;

  return (
    <div className="max-w-xl mx-auto mt-20 p-6 border rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Mon Profil</h1>
      <p>
        <strong>Pseudo :</strong> {user?.pseudo}
      </p>
      <p>
        <strong>Email :</strong> {user?.email}
      </p>
    </div>
  );
}
