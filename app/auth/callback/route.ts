import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/'
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  if (code) {
    try {
      // Exchange the code for a session
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) throw error

      // Get the user's session
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No session found')

      // Check if this is a new user
      const isNewUser = session.user.created_at === session.user.last_sign_in_at
      const provider = session.user.app_metadata.provider

      // For email signups that need verification
      if (isNewUser && (!provider || provider === 'email')) {
        return NextResponse.redirect(new URL('/signup/verify', request.url))
      }

      // For Google sign-ins or returning users
      const successMessage = isNewUser ? 'Account created successfully!' : 'Welcome back!'
      const redirectUrl = new URL(next, request.url)
      redirectUrl.searchParams.set('message', successMessage)
      return NextResponse.redirect(redirectUrl)

    } catch (error) {
      console.error('Auth callback error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed'
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(errorMessage)}`, request.url)
      )
    }
  }

  // If no code is present, redirect to login
  return NextResponse.redirect(new URL('/login', request.url))
} 