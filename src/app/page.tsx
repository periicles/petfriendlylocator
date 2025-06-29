'use client';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center text-center space-y-32 px-4 py-16 md:py-32 max-w-4xl mx-auto">
      {/* Section 1 */}
      <section className="space-y-4">
        <h2 className="text-3xl md:text-5xl font-bold">🐾 Pet Friendly Locator</h2>
        <p className="text-lg text-gray-700">
          Une application pour découvrir et partager les lieux accueillants pour vos animaux dans la
          région de Bordeaux.
        </p>
      </section>

      {/* Section 2 */}
      <section className="space-y-4">
        <h2 className="text-3xl md:text-4xl font-bold">🧭 Comment ça fonctionne</h2>
        <p className="text-lg text-gray-700">
          Explorez une carte interactive, ajoutez des lieux, laissez des avis et aidez la communauté
          à trouver les meilleurs spots pet friendly.
        </p>
      </section>

      {/* Section 3 */}
      <section className="space-y-4">
        <h2 className="text-3xl md:text-4xl font-bold">📬 Me contacter</h2>
        <p className="text-lg text-gray-700">
          Une question ou une suggestion ? Écrivez-moi à :<br />
          <a href="mailto:contact@petfriendlylocator.fr" className="text-blue-600 hover:underline">
            contact@petfriendlylocator.fr
          </a>
        </p>
      </section>
    </div>
  );
}
