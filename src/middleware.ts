import { NextRequest, NextResponse } from 'next/server';
import * as jose from 'jose';

// Only perform authentication check in middleware, no database operations
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Handle affiliate tracking for signup page
  if (path === '/signup') {
    // Check if the URL already has a referral code in query params
    const url = new URL(request.url);
    const hasRefParam = url.searchParams.has('ref');
    
    // If there's no ref param but there is an affiliate cookie, add the ref param
    if (!hasRefParam) {
      const affiliateRef = request.cookies.get('affiliate_ref')?.value;
      if (affiliateRef) {
        url.searchParams.set('ref', affiliateRef);
        return NextResponse.redirect(url);
      }
    }
  }

  // Authentication check for any protected routes
  if (path.startsWith('/admin') || path.startsWith('/api/admin') || path.startsWith('/humanize')) {
    // Check if the user is authenticated by looking for auth_token cookie
    const authToken = request.cookies.get('auth_token')?.value;
    
    if (!authToken) {
      console.log('Middleware: No auth_token cookie found, redirecting to login');
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // For admin routes, also check admin privileges
    if (path.startsWith('/admin') || path.startsWith('/api/admin')) {
      try {
        // Verify the token and check isAdmin flag using jose
        const secret = new TextEncoder().encode(
          process.env.JWT_SECRET || 'fallback_secret_please_set_env_var'
        );
        
        const { payload } = await jose.jwtVerify(authToken, secret);
        
        if (!payload.isAdmin) {
          // For API routes, return unauthorized
          if (path.startsWith('/api/')) {
            return new NextResponse(
              JSON.stringify({ error: 'You do not have permission to access this resource' }),
              { status: 403, headers: { 'content-type': 'application/json' } }
            );
          }
          
          // For page routes, redirect to dashboard
          console.log('Middleware: User is not an admin, redirecting to dashboard');
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        
        console.log('Middleware: Admin access granted');
      } catch (error) {
        // Token verification failed
        console.error('Middleware: Token verification failed', error);
        return NextResponse.redirect(new URL('/login', request.url));
      }
    }
    
    // Continue with the token value for authenticated routes
    console.log(`Middleware: Auth token found for ${path}`);
  }
  
  // Continue with request for authenticated users or public routes
  return NextResponse.next();
}

// Configure specifically which routes this middleware runs on
export const config = {
  matcher: [
    '/api/admin/:path*',
    '/admin/:path*',
    '/humanize',
    '/signup'
  ],
}; 