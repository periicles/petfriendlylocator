import './globals.css';
import { Providers } from '@/providers';
import ClientNavbarWrapper from '@/components/ClientNavbarWrapper';
import type { Metadata } from 'next';
import { Geist } from 'next/font/google';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Pet Friendly Locator',
  description: 'Trouvez des lieux accueillants pour vos animaux à Bordeaux',
  icons: { icon: '/PFB.png' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${geist.variable} font-sans`}>
      <body className="min-h-screen flex flex-col isolate bg-background text-foreground">
        <Providers>
          <ClientNavbarWrapper />
          <main className="flex-1 pt-16">{children}</main>
          <footer className="border-t py-4 text-center text-sm text-muted-foreground">
            © 2025 Pet Friendly Locator
          </footer>
        </Providers>
      </body>
    </html>
  );
}
