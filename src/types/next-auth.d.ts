/* eslint-disable no-unused-vars */
import 'next-auth';
import { UserRole } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      pseudo: string;
      roles?: UserRole;
      name?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    roles: UserRole;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    roles?: UserRole;
  }
}
