import Link from 'next/link';

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-muted/40 p-4">
        <nav className="flex flex-col gap-2 text-sm">
          <Link
            href="/profile"
            className="rounded-md px-2 py-1.5 hover:bg-accent hover:text-accent-foreground"
          >
            Utilisateur
          </Link>
          <Link
            href="/profile/places"
            className="rounded-md px-2 py-1.5 hover:bg-accent hover:text-accent-foreground"
          >
            Lieux ajoutés
          </Link>
          <Link
            href="/profile/reviews"
            className="rounded-md px-2 py-1.5 hover:bg-accent hover:text-accent-foreground"
          >
            Avis
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
