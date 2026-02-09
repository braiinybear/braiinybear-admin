// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    const { pathname } = request.nextUrl;

    // Allow public paths and API routes (like auth)
    if (
        pathname.startsWith('/api') ||
        pathname === '/' ||
        pathname.startsWith('/_next') ||
        pathname === '/login' ||
        pathname === '/register' ||
        pathname.startsWith('/images') ||
        pathname.startsWith('/logo') ||
        pathname === '/favicon.ico'
    ) {
        return NextResponse.next();
    }

    // Check if user is authenticated
    if (!token) {
        // Redirect unauthenticated users to login page
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
    }

    // Role-based authorization for /admin routes
    if (pathname.startsWith('/admin')) {
        const userRole = token.role as string;

        // Only ADMIN role can access /admin routes
        if (userRole !== 'ADMIN') {
            // Redirect non-admin users to their role-specific dashboard
            let redirectPath = '/';

            switch (userRole) {
                case 'SALES':
                    redirectPath = '/sales';
                    break;
                case 'TECHNICAL':
                    redirectPath = '/technical';
                    break;
                case 'HR':
                    redirectPath = '/hr';
                    break;
                case 'MEDIA':
                    redirectPath = '/media';
                    break;
                case 'EMPLOYEE':
                    redirectPath = '/employee';
                    break;
                default:
                    redirectPath = '/login';
            }

            const redirectUrl = new URL(redirectPath, request.url);
            return NextResponse.redirect(redirectUrl);
        }
    }

    return NextResponse.next();
}
