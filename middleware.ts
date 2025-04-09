import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip middleware for public paths and API routes
  const publicPaths = [
    '/login', 
    '/signup', 
    '/auth/callback', 
    '/_next', 
    '/favicon.ico',
    '/images',
    '/api'
  ]
  
  // Check if we should skip middleware
  if (publicPaths.some(path => pathname.startsWith(path)) || pathname === '/') {
    return NextResponse.next()
  }
  
  try {
    // Create a response to modify
    const res = NextResponse.next()
    
    // Check for the presence of a session
    const supabase = createMiddlewareClient({ req: request, res })
  
    const { data: { session } } = await supabase.auth.getSession()
  
    // Handle unauthenticated users
    if (!session) {
      console.log("Middleware: No session found, redirecting to login");
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  
    // For any authenticated user, let the request proceed
    return res
  } catch (error) {
    console.error("Middleware error:", error);
    // If there's an error (like cookie parsing), redirect to login
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }
}

export const config = {
  // Only run the middleware on the following paths
  matcher: [
    // Exclude all paths that should bypass the middleware
    '/((?!_next/static|_next/image|favicon.ico|images/|api/).*)',
  ],
} 