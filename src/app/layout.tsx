import './globals.css';
import { Providers } from '@/providers';
import Navbar from '@/components/Navbar';

export const metadata = {
	title: 'Pet Friendly Locator',
	description: 'Trouvez des lieux accueillants pour vos animaux à Bordeaux',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="fr">
			<body>
				<Providers>
					<Navbar />
					{children}
				</Providers>
			</body>
		</html>
	);
}
