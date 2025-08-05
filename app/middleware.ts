// app/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  const { pathname } = request.nextUrl;

  // Allow public paths and API routes (like auth)
  if (pathname.startsWith('/api/auth') || pathname === '/' || pathname.startsWith('/_next')) {
    return NextResponse.next();
  }

  // Protect /admin routes
  if (pathname.startsWith('/admin') && !token) {
    // Redirect unauthenticated users to sign-in page
    const signInUrl = new URL('/api/auth/signin', request.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}
