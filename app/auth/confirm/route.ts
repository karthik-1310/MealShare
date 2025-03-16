import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  console.log('🔴 CONFIRM ROUTE ACCESSED:', request.url);
  
  try {
    const requestUrl = new URL(request.url);
    console.log('📋 FULL URL RECEIVED:', requestUrl.toString());
    console.log('📋 URL PARAMS:', Object.fromEntries(requestUrl.searchParams.entries()));
    
    // Check Supabase parameters
    const token_hash = requestUrl.searchParams.get('token_hash');
    const type = requestUrl.searchParams.get('type');
    const email = requestUrl.searchParams.get('email'); // Supabase sometimes includes this
    
    console.log('🔑 TOKEN INFO:', { 
      token_hash: token_hash ? `${token_hash.substring(0, 10)}...` : 'null', 
      type,
      email: email || 'not provided'
    });
    
    if (!token_hash || !type) {
      console.error('❌ Missing required parameters for verification');
      
      // If we have an email, include it in the redirect for better UX
      const emailParam = email ? `&email=${encodeURIComponent(email)}` : '';
      
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=invalid_link&message=${encodeURIComponent('Invalid verification link. Required parameters missing.')}${emailParam}`
      );
    }

    // Initialize Supabase
    console.log('🔄 Creating Supabase client');
    const supabase = createRouteHandlerClient({ cookies });
    
    console.log('🔄 Attempting to verify OTP with token_hash');
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as any,
    });

    if (error) {
      console.error('❌ VERIFICATION ERROR:', error.message);
      
      // Check for expired token specifically
      const isExpired = error.message.includes('expired');
      
      // Try to extract email from error message if not provided
      let emailToUse = email;
      if (!emailToUse) {
        const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/;
        const match = error.message.match(emailRegex);
        if (match && match[1]) {
          emailToUse = match[1];
        }
      }
      
      // Add email to parameters if available
      const emailParam = emailToUse ? `&email=${encodeURIComponent(emailToUse)}` : '';
      
      // If it's an expired token, use a special redirect with a flag to show the expired link UI
      if (isExpired) {
        console.log('⏰ Token expired! Redirecting to expired link page');
        return NextResponse.redirect(
          `${requestUrl.origin}/login?error=expired_link&error_code=token_expired&error_description=${encodeURIComponent(error.message)}${emailParam}`
        );
      }
      
      // For other errors
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=verification_failed&message=${encodeURIComponent(error.message)}${emailParam}`
      );
    }
    
    // Successfully verified
    console.log('✅ VERIFICATION SUCCESSFUL!', data);
    const verifiedEmail = data?.user?.email || email || '';
    console.log('📧 Verified email:', verifiedEmail);
    
    // Create multiple timestamp-based unique identifiers to avoid caching
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    
    // Create redirect URL with explicit verification success parameters
    const redirectUrl = `${requestUrl.origin}/login?verified=true&email=${encodeURIComponent(verifiedEmail)}&t=${timestamp}&rid=${randomId}#verification_success=true`;
    console.log('🔀 Redirecting to:', redirectUrl);
    
    // Create response with verification cookies
    const response = NextResponse.redirect(redirectUrl);
    
    // Set multiple cookies as signals
    const cookieOptions = {
      path: '/',
      maxAge: 300, // 5 minutes
      secure: process.env.NODE_ENV === 'production',
      httpOnly: false, // Allow JS to access
      sameSite: 'lax' as const
    };
    
    response.cookies.set('just_verified', 'true', cookieOptions);
    response.cookies.set('email_verified', 'true', cookieOptions);
    response.cookies.set('verification_timestamp', timestamp.toString(), cookieOptions);
    
    if (verifiedEmail) {
      response.cookies.set('verified_email', verifiedEmail, cookieOptions);
    }
    
    return response;
  } catch (error) {
    console.error('💥 UNEXPECTED ERROR:', error);
    const requestUrl = new URL(request.url);
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=system_error&message=${encodeURIComponent('An unexpected error occurred during verification. Please try again.')}`
    );
  }
} 