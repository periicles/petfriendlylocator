import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './prisma';
import { compare } from 'bcryptjs';

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
