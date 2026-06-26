'use client';

export default function HomePage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col items-center space-y-32 px-4 py-16 text-center md:py-32">
      {/* Section 1 */}
      <section className="space-y-4">
        <h2 className="text-3xl font-bold md:text-5xl">🐾 Pet Friendly Locator</h2>
        <p className="text-lg text-muted-foreground">
          Une application pour découvrir et partager les lieux accueillants pour vos animaux dans la
          région de Bordeaux.
        </p>
      </section>

      {/* Section 2 */}
      <section className="space-y-4">
        <h2 className="text-3xl font-bold md:text-4xl">🧭 Comment ça fonctionne</h2>
        <p className="text-lg text-muted-foreground">
          Explorez une carte interactive, ajoutez des lieux, laissez des avis et aidez la communauté
          à trouver les meilleurs spots pet friendly.
        </p>
      </section>

      {/* Section 3 */}
      <section className="space-y-4">
        <h2 className="text-3xl font-bold md:text-4xl">📬 Me contacter</h2>
        <p className="text-lg text-muted-foreground">
          Une question ou une suggestion ? Écrivez-moi à :<br />
          <a
            href="mailto:contact@petfriendlylocator.fr"
            className="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
          >
            contact@petfriendlylocator.fr
          </a>
        </p>
      </section>
    </div>
  );
}
