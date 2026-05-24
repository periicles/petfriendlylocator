/* eslint-disable no-unused-vars */
import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      pseudo: string;
      name?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
  }
}
