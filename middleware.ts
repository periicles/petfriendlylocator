import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';
import { authConfig } from '@/lib/auth.config';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isAuth = !!req.auth;

  const isAuthPage = nextUrl.pathname === '/login' || nextUrl.pathname === '/register';
  const isAdminPage = nextUrl.pathname === '/admin' || nextUrl.pathname.startsWith('/admin/');

  if (isAuth && isAuthPage) {
    return NextResponse.redirect(new URL('/', nextUrl));
  }

  if (isAdminPage && req.auth?.user?.roles !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', nextUrl));
  }

  return NextResponse.next();
});

// Appliquer le middleware aux pages auth et à l'espace admin
export const config = {
  matcher: ['/login', '/register', '/admin', '/admin/:path*'],
};
