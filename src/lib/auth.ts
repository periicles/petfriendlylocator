import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { prisma } from './prisma';
import { authConfig } from './auth.config';

/**
 * Auth.js (v5) instance. Node-only: the Credentials `authorize` uses prisma +
 * bcrypt. Edge code (middleware) must import `authConfig`, not this module.
 *
 * The `jwt` callback (in `auth.config.ts`) injects `user.user_id` into
 * `token.sub` and `roles`; the `session` callback re-exposes them as
 * `session.user.id` / `session.user.roles` (typed in `src/types/next-auth.d.ts`).
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });
        if (!user) return null;

        const isValid = await compare(credentials.password as string, user.password);
        if (!isValid) return null;

        return {
          id: user.user_id,
          email: user.email,
          name: user.pseudo,
          roles: user.roles,
        };
      },
    }),
  ],
});
