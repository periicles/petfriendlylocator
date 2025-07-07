import Link from 'next/link';

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-100 p-4 border-r">
        <nav className="flex flex-col gap-4">
          <Link href="/profile">Utilisateur</Link>
          <Link href="/profile/places">Lieux ajoutés</Link>
          <Link href="/profile/reviews">Avis</Link>
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
