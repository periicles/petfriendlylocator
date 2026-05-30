import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './prisma';
import { compare } from 'bcryptjs';

/**
 * NextAuth configuration.
 *
 * Why JWT sessions (not DB-backed):
 *   - lets `/api/locations/*` route handlers authenticate stateless via
 *     `getToken({ req })` without an extra DB round-trip per request;
 *   - avoids maintaining a `Session` table alongside `User` in Prisma.
 *
 * The `jwt` callback injects `user.user_id` into `token.sub`; the `session`
 * callback re-exposes it as `session.user.id` (typed in
 * `src/types/next-auth.d.ts`) so client components can read the user id
 * without a separate `/api/user/me` call.
 */
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) return null;

        const isValid = await compare(credentials.password, user.password);
        if (!isValid) return null;

        return {
          id: user.user_id,
          email: user.email,
          name: user.pseudo,
        };
      },
    }),
  ],

  pages: {
    signIn: '/login',
  },

  session: {
    strategy: 'jwt', // 👈 nécessaire pour API Routes sécurisées avec JWT
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id; // 👈 ID utilisateur injecté dans le token
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.sub) {
        session.user.id = token.sub; // 👈 ID accessible dans client side session
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET, // 👈 .env obligatoire
};
