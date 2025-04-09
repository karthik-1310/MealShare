import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  console.log('🚀 AUTH CALLBACK ROUTE TRIGGERED:', request.url);
  
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    
    // Always redirect to select-role after successful authentication
    console.log('🔍 Callback parameters:', { code: code ? `${code.substring(0, 8)}...` : 'null' });
    
    if (!code) {
      console.error('❌ No code provided in callback');
      return NextResponse.redirect(`${requestUrl.origin}/login?error=no_code&message=${encodeURIComponent('Authentication failed: No code provided')}`);
    }
    
    // Exchange the code for a session
    const supabase = createRouteHandlerClient({ cookies });
    
    // Debug cookie presence
    console.log('🍪 Cookies present in request');
    
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('❌ Code exchange error:', error.message);
      return NextResponse.redirect(`${requestUrl.origin}/login?error=auth_error&message=${encodeURIComponent(error.message)}`);
    }
    
    // Success! Get the session to confirm login worked
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      console.log('✅ Successfully authenticated user:', session.user.email);
      console.log('🔀 Redirecting to role selection page');
      
      // Create a redirect URL with a timestamp to prevent caching
      const timestamp = Date.now();
      const redirectUrl = `${requestUrl.origin}/select-role?t=${timestamp}`;
      console.log('🔀 Redirect URL:', redirectUrl);
      
      // Always redirect to role selection page
      return NextResponse.redirect(redirectUrl);
    } else {
      console.error('⚠️ Code exchange worked but no session was created');
      return NextResponse.redirect(`${requestUrl.origin}/login?error=no_session&message=${encodeURIComponent('Authentication successful but no session was created')}`);
    }
  } catch (error) {
    console.error('💥 Authentication callback error:', error);
    const requestUrl = new URL(request.url);
    return NextResponse.redirect(`${requestUrl.origin}/login?error=unexpected&message=${encodeURIComponent('An unexpected error occurred during authentication')}`);
  }
} 