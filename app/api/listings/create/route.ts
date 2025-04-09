import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

export async function POST(request: Request) {
  try {
    // Properly handle cookies
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ 
      cookies: () => cookieStore 
    })
    
    // Get current session
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      console.error('No session found in create listing API')
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }
    
    // Get user role to verify it's a provider
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()
    
    if (profileError) {
      console.error('Error fetching user profile:', profileError.message)
      return NextResponse.json(
        { error: 'Failed to verify user role' },
        { status: 500 }
      )
    }
    
    // Ensure user is a provider
    // The role can be either 'provider' (DB format) or 'prov' (frontend format)
    if (userProfile?.role !== 'provider' && userProfile?.role !== 'prov') {
      console.error('User is not a provider:', userProfile?.role)
      return NextResponse.json(
        { error: 'Only food providers can create listings' },
        { status: 403 }
      )
    }
    
    // Get listing data from request
    const listingData = await request.json()
    console.log('Listing data received:', JSON.stringify(listingData))
    
    if (!listingData) {
      console.error('No listing data provided')
      return NextResponse.json(
        { error: 'Listing data is required' },
        { status: 400 }
      )
    }
    
    // Validate required fields
    const requiredFields = ['title', 'description', 'food_type', 'quantity', 'expiration_date', 'location']
    for (const field of requiredFields) {
      if (!listingData[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        )
      }
    }
    
    // Set default values if not provided
    const listingInsert = {
      ...listingData,
      provider_id: session.user.id,
      status: listingData.status || 'available',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    console.log('Inserting listing:', listingInsert)
    
    // Insert into listings table
    const { data: listing, error } = await supabase
      .from('listings')
      .insert(listingInsert)
      .select('id')
      .single()
    
    if (error) {
      console.error('Error creating listing:', error.message)
      return NextResponse.json(
        { error: `Failed to create listing: ${error.message}` },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      id: listing.id,
      message: 'Listing created successfully'
    })
    
  } catch (error: any) {
    console.error('API: Unexpected error in create listing:', error)
    return NextResponse.json(
      { error: `Internal server error: ${error?.message || 'Unknown error'}` },
      { status: 500 }
    )
  }
} 