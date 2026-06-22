import type { NextAuthConfig } from 'next-auth';

/**
 * Edge-safe Auth.js config: no Node-only imports (prisma/bcrypt), so it can be
 * loaded by the edge middleware to decode the JWT. The Credentials provider's
 * `authorize` (prisma + bcrypt) is added in the Node-only `auth.ts`.
 *
 * Why JWT sessions: lets route handlers and middleware authenticate statelessly
 * via `auth()` without a per-request DB round-trip, and Credentials requires JWT.
 */
export const authConfig = {
  pages: { signIn: '/login' },
  session: { strategy: 'jwt' },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.roles = user.roles;
      }
      return token;
    },
    session({ session, token }) {
      if (token?.sub) {
        session.user.id = token.sub;
        session.user.roles = token.roles;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
