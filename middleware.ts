import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });

  const isAuth = !!token;
  const { pathname } = req.nextUrl;

  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isAdminPage = pathname === '/admin' || pathname.startsWith('/admin/');

  if (isAuth && isAuthPage) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  if (isAdminPage && token?.roles !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

// Appliquer le middleware aux pages auth et à l'espace admin
export const config = {
  matcher: ['/login', '/register', '/admin', '/admin/:path*'],
};
