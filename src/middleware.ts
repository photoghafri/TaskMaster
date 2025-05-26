import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Skip middleware for NextAuth routes, public assets, and auth pages
  if (
    request.nextUrl.pathname.startsWith('/api/auth/') ||
    request.nextUrl.pathname.startsWith('/_next/') ||
    request.nextUrl.pathname.startsWith('/auth/') ||
    request.nextUrl.pathname.includes('/favicon.ico') ||
    request.nextUrl.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-key-for-development-only'
    });

    // Protect API routes
    if (request.nextUrl.pathname.startsWith('/api/')) {
      if (!token) {
        return new NextResponse(
          JSON.stringify({ error: 'Authentication required' }),
          { status: 401, headers: { 'content-type': 'application/json' } }
        );
      }

      // For POST, PUT, DELETE operations on team endpoints, ensure user is admin
      if (request.nextUrl.pathname.startsWith('/api/team') &&
          request.method !== 'GET' &&
          token.role !== 'ADMIN') {
        return new NextResponse(
          JSON.stringify({ error: 'Admin access required' }),
          { status: 403, headers: { 'content-type': 'application/json' } }
        );
      }
    } else {
      // For non-API routes, redirect unauthenticated users to signin
      if (!token) {
        try {
          const signInUrl = new URL('/auth/signin', request.url);
          signInUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
          return NextResponse.redirect(signInUrl);
        } catch (urlError) {
          console.error('URL construction error:', urlError);
          // Fallback redirect without callback URL
          return NextResponse.redirect(new URL('/auth/signin', request.url));
        }
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);

    // For API routes, return a JSON error
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return new NextResponse(
        JSON.stringify({ error: 'Authentication service unavailable' }),
        { status: 500, headers: { 'content-type': 'application/json' } }
      );
    }

    // For other routes, just continue
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};