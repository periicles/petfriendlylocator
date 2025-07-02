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
      <head />
      <body className="min-h-screen isolate font-sans bg-vintage-light text-vintage-black">
        <Providers>
          <ClientNavbarWrapper />
          <main className="pt-16">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
