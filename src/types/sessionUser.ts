export type SessionUser = {
  id: string;
  email: string;
  pseudo?: string;
  role?: 'USER' | 'ADMIN';
};
