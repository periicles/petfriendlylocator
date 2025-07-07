import './globals.css';
import { Providers } from '@/providers';
import ClientNavbarWrapper from '@/components/ClientNavbarWrapper';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pet Friendly Locator',
  description: 'Trouvez des lieux accueillants pour vos animaux à Bordeaux',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="bg-vintage-light text-vintage-black">
      <link rel="icon" href="/PFB.png" />
      <body className="min-h-screen flex flex-col isolate font-sans bg-vintage-light text-vintage-black">
        <Providers>
          <ClientNavbarWrapper />
          <main className="flex-1 pt-16 bg-[var(--vintage-beige)]">{children}</main>
          <footer className="py-4 text-center text-sm bg-[var(--vintage-light)] text-[var(--vintage-taupe)]">
            © 2025 Pet Friendly Locator
          </footer>
        </Providers>
      </body>
    </html>
  );
}
