import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('token_hash')
    const type = requestUrl.searchParams.get('type')
    const next = requestUrl.searchParams.get('next') || '/'
    
    if (code) {
      const supabase = createRouteHandlerClient({ cookies })
      
      // Verify the email
      const { error } = await supabase.auth.verifyOtp({
        token_hash: code,
        type: type as any,
      })

      if (error) {
        return NextResponse.redirect(
          new URL(`/login?error=Could not verify email: ${error.message}`, requestUrl.origin)
        )
      }

      // Get the user session
      const { data: { session } } = await supabase.auth.getSession()

      if (session) {
        // Set the auth cookie
        const response = NextResponse.redirect(new URL(next, requestUrl.origin))
        response.cookies.set('supabase-auth-token', session.access_token, {
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
        })
        return response
      }
    }

    // If something goes wrong, redirect to login
    return NextResponse.redirect(new URL('/login?error=Could not verify email', requestUrl.origin))
  } catch (error) {
    return NextResponse.redirect(
      new URL(`/login?error=An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`, request.url)
    )
  }
} 