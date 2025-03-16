# MealShare Project Implementation Guide
**"Feeding Hope, One Meal at a Time"**

A platform connecting restaurants/food providers with NGOs/welfare organizations to distribute surplus food via a bidding system.

## Project Overview

### Tech Stack
- **Next.js** (App Router)
- **shadcn/ui** for components
- **Supabase** (Auth + Database + Realtime)
- **Lucide** for icons
- **Tailwind CSS**
- **Framer Motion**
- **TypeScript**
- **Razorpay** for payments
- **Mapbox** for delivery tracking
- **React-Email** for notifications
- **Resend** for email delivery

### File Structure
```
MealShare/
├── package.json
├── package-lock.json
├── node_modules/
└── my-app/
    ├── app/
    │   ├── auth/
    │   │   └── callback/       # Supabase auth callback
    │   ├── verify-otp/         # OTP verification
    │   ├── signup/             # Custom signup form
    │   ├── login/              # Custom login form
    │   ├── layout.tsx          # Root layout with AuthProvider
    │   ├── page.tsx            # Homepage
    │   └── globals.css         # Global styles
    ├── components/
    │   ├── auth/               # Auth UI components
    │   ├── ui/                 # shadcn/ui components
    │   ├── theme-toggle.tsx    # Dark/light mode switch
    │   ├── food-listing-card.tsx
    │   └── payment-gateway.tsx
    ├── lib/
    │   ├── supabase/           # Client config
    │   └── auth-actions.ts     # Auth functions
    ├── public/                 # Static assets
    ├── tailwind.config.ts
    ├── next.config.ts
    └── types/                  # TypeScript types
```

## MealShare Implementation Sequence (Supabase Edition)

## 1. Core Infrastructure Setup

### 1.1 Authentication System
1.1.1 Install Supabase Auth: `npm install @supabase/supabase-js @supabase/ssr`

1.1.2 Configure Supabase Provider in app/layout.tsx:
```tsx
import { createClient } from '@/lib/supabase/client'
import { AuthProvider } from '@/components/auth-provider'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
```

1.1.3 Create custom SignIn/SignUp pages using Supabase methods:
```tsx
// app/login/page.tsx
'use client'
import { signInWithPassword } from '@/lib/auth-actions'

export default function LoginPage() {
  const handleSubmit = async (e: React.FormEvent) => {
    const formData = new FormData(e.currentTarget)
    await signInWithPassword(
      formData.get('email') as string,
      formData.get('password') as string
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Your form UI */}
    </form>
  )
}
```

1.1.4 Set up Google OAuth in Supabase Dashboard

1.1.5 Implement OTP verification flow in /verify-otp using Supabase Auth

### 1.2 Database Foundation
1.2.1 Initialize Supabase client in lib/supabase.ts:
```ts
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
```

1.2.2 Set environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

1.2.3 Build core tables:
```sql
-- user_profiles table
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  role VARCHAR(20) NOT NULL CHECK (role IN ('provider', 'ngo', 'individual')),
  phone VARCHAR(15),
  org_id UUID REFERENCES organizations,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  address TEXT,
  type VARCHAR(20) NOT NULL CHECK (type IN ('restaurant', 'ngo', 'other')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- food_listings table
CREATE TABLE food_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID REFERENCES auth.users NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  location GEOGRAPHY(POINT),
  best_by TIMESTAMPTZ NOT NULL,
  images TEXT[],
  min_bid NUMERIC,
  is_urgent BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'active' 
    CHECK (status IN ('active', 'accepted', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- bids table
CREATE TABLE bids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES food_listings NOT NULL,
  bidder_id UUID REFERENCES auth.users NOT NULL,
  amount NUMERIC NOT NULL,
  is_accepted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

1.2.4 Enable Row Level Security (RLS) with policies:
```sql
-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;

-- Example policy for food_listings
CREATE POLICY "Providers can insert their own listings" 
ON food_listings FOR INSERT 
WITH CHECK (auth.uid() = provider_id);

CREATE POLICY "Everyone can view active listings" 
ON food_listings FOR SELECT 
USING (status = 'active');
```

1.2.5 Set up database triggers for automatic profile creation:
```sql
CREATE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, role)
  VALUES (NEW.id, 'individual');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE handle_new_user();
```

## 2. User Management System

### 2.1 Auth-DB Synchronization
2.1.1 Create auth change listener in components/auth-provider.tsx:
```tsx
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      if (session?.user) {
        // Handle session changes
      }
    }
  )
  return () => subscription?.unsubscribe()
}, [])
```

2.1.2 Implement user profile sync to Supabase users table

2.1.3 Add role selection during sign-up:
```tsx
const handleSignUp = async (email, password, role) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { role } }
  })
}
```

2.1.4 Build profile completion form (post-signup redirect)

### 2.2 Role-Based Access Control
2.2.1 Create middleware with Supabase session check:
```ts
export async function middleware(req: NextRequest) {
  const supabase = createMiddlewareClient({ req })
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
}
```

2.2.2 Implement provider dashboard layout

2.2.3 Build NGO bidding interface shell

## 3. Food Listing Management

### 3.1 Listing Creation Flow
3.1.1 Create components/food-listing-form.tsx

3.1.2 Connect form to Supabase with geolocation:
```ts
await supabase.from('food_listings').insert({
  ...formData,
  provider_id: user.id,
  location: `POINT(${lng} ${lat})`
})
```

3.1.3 Implement image upload using Supabase Storage:
```tsx
const uploadImage = async (file) => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Math.random()}.${fileExt}`
  const { data, error } = await supabase.storage
    .from('listing-images')
    .upload(`public/${fileName}`, file)
  
  return data?.path
}
```

3.1.4 Add "Urgent Pickup" toggle with geolocation

### 3.2 Listing Display System
3.2.1 Build components/food-listing-card.tsx

3.2.2 Create auto-refresh carousel for urgent listings:
```tsx
// components/food-listings.tsx
const { data } = await supabase
  .from('food_listings')
  .select('*')
  .eq('is_urgent', true)
  .order('best_by', { ascending: true })
```

3.2.3 Implement "Best By" timer component

3.2.4 Add realtime updates:
```tsx
const channel = supabase.channel('listings')
  .on('postgres_changes', { event: '*', schema: 'public' }, updateListings)
  .subscribe()
```

## 4. Bidding Engine

### 4.1 Core Bidding Functionality
4.1.1 Create bid submission form

4.1.2 Implement bid validation against min_bid

4.1.3 Build bid history table with sorting:
```sql
-- Get bids for a listing
SELECT * FROM bids 
WHERE listing_id = :listingId 
ORDER BY amount DESC, created_at ASC;
```

4.1.4 Realtime bid updates:
```ts
const bidsChannel = supabase.channel('bids-channel')
  .on('postgres_changes', { event: 'INSERT' }, handleNewBid)
  .subscribe()
```

### 4.2 Bid Management
4.2.1 Create provider's bid review interface

4.2.2 Implement bid acceptance API endpoint:
```ts
// lib/bid-actions.ts
export const acceptBid = async (bidId: string) => {
  await supabase
    .from('bids')
    .update({ is_accepted: true })
    .eq('id', bidId)
}
```

4.2.3 Add confirmation modal for bid acceptance:
```tsx
// Accept bid API route
export async function POST(req: Request) {
  const { bidId } = await req.json();
  const { data, error } = await supabase
    .from('bids')
    .update({ is_accepted: true })
    .eq('id', bidId);
  
  // Trigger email notification
  await resend.emails.send({
    from: 'MealShare <notify@mealshare.org>',
    to: bidderEmail,
    subject: 'Your Bid Was Accepted!',
    react: <BidAcceptedEmail />
  });
}
```

4.2.4 Set up email notifications using Resend

## 5. Order Confirmation System

### 5.1 Payment Gateway Integration
5.1.1 Set up Razorpay account and API keys

5.1.2 Create payment endpoint with Supabase verification:
```ts
const { data: payment } = await supabase
  .from('payments')
  .insert({ user_id: user.id, amount })
```

5.1.3 Build components/payment-button.tsx:
```tsx
// components/payment-button.tsx
import Razorpay from 'razorpay';

const startPayment = async (orderId: string) => {
  const options = {
    key: process.env.RAZORPAY_KEY_ID,
    amount: "50000", // ₹500.00
    currency: "INR",
    order_id: orderId,
    handler: async (response: any) => {
      await verifyPayment(response);
    }
  };
  
  const rzp = new Razorpay(options);
  rzp.open();
}
```

5.1.4 Implement payment verification webhook:
```ts
// api/webhook/route.ts
export async function POST(req: Request) {
  const body = await req.json()
  await verifySignature(body)
  await supabase
    .from('payments')
    .insert({ ...body, status: 'completed' })
}
```

### 5.2 Confirmation Workflow
5.2.1 Create 30-minute countdown timer component

5.2.2 Implement confirmation status tracking:
```sql
-- Supabase function for confirmation expiry
create or replace function handle_bid_confirmation()
returns trigger as $$
begin
  perform pg_notify(
    'bid_confirmation', 
    json_build_object(
      'bid_id', NEW.id,
      'expires_at', NOW() + interval '30 minutes'
    )::text
  );
  return NEW;
end;
$$ language plpgsql;

create trigger bid_accept_trigger
after update of is_accepted on bids
for each row
when (NEW.is_accepted = true)
execute function handle_bid_confirmation();
```

5.2.3 Build cancellation fee calculation system:
```ts
// lib/cancellations.ts
export const chargeFee = async (userId: string) => {
  await supabase.rpc('charge_cancellation_fee', {
    user_id: userId,
    amount: 50
  })
}
```

5.2.4 Add backup bid fallback mechanism

## 6. Delivery Management

### 6.1 Tracking System
6.1.1 Integrate Mapbox GL JS:
```tsx
// components/delivery-map.tsx
import { useLoadScript } from '@react-google-maps/api'

export default function DeliveryMap() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_MAPS_KEY!
  })
  return isLoaded ? <MapComponent /> : <Loader />
}
```

6.1.2 Create delivery status update endpoints:
```ts
// api/delivery/route.ts
export async function POST(req: Request) {
  const { lat, lng } = await req.json()
  await supabase
    .from('deliveries')
    .update({ location: `POINT(${lng} ${lat})` })
}
```

6.1.3 Build realtime tracking interface:
```tsx
const channel = supabase.channel('location-updates')
  .on('postgres_changes', { event: 'UPDATE' }, updateLocation)
  .subscribe()
```

6.1.4 Implement driver assignment logic

### 6.2 Pickup Verification
6.2.1 Create QR generation endpoint:
```ts
// lib/qr-actions.ts
export const generateQR = async (userId: string) => {
  const { data } = await supabase
    .rpc('generate_qr_code', { user_id: userId })
  return data
}
```

# MealShare Remaining Components

## 6. Delivery Management (continued)

### 6.2 Pickup Verification
#### 6.2.2 Build scanner component with react-qr-reader
```tsx
// components/qr-scanner.tsx
'use client'
import { useState } from 'react'
import { QrReader } from 'react-qr-reader'
import { verifyPickup } from '@/lib/delivery-actions'

export default function QRScanner({ orderId }) {
  const [scanned, setScanned] = useState(false)
  
  const handleScan = async (result) => {
    if (result && !scanned) {
      setScanned(true)
      await verifyPickup(orderId, result.text)
    }
  }
  
  return (
    <div className="w-full max-w-md mx-auto">
      <QrReader
        constraints={{ facingMode: 'environment' }}
        onResult={handleScan}
        className="rounded-lg overflow-hidden"
      />
      {scanned && (
        <div className="mt-4 p-3 bg-green-100 text-green-800 rounded">
          Pickup verified successfully!
        </div>
      )}
    </div>
  )
}
```

#### 6.2.3 Implement pickup confirmation API
```tsx
// app/api/pickup/verify/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  const { orderId, qrCode } = await req.json()
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
  
  // Verify QR code against database record
  const { data, error } = await supabase
    .from('delivery_codes')
    .select('*')
    .eq('order_id', orderId)
    .eq('code', qrCode)
    .single()
  
  if (error || !data) {
    return Response.json({ success: false, message: 'Invalid QR code' }, { status: 400 })
  }
  
  // Update delivery status
  await supabase
    .from('deliveries')
    .update({ status: 'picked_up', picked_at: new Date().toISOString() })
    .eq('order_id', orderId)
  
  return Response.json({ success: true })
}
```

#### 6.2.4 Add verification history tracking
```sql
-- verification_history table in Supabase
CREATE TABLE verification_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  delivery_id UUID REFERENCES deliveries NOT NULL,
  verified_by UUID REFERENCES auth.users NOT NULL,
  verification_type VARCHAR(20) NOT NULL CHECK (verification_type IN ('qr', 'otp', 'manual')),
  location GEOGRAPHY(POINT),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policy
CREATE POLICY "Only verified users can view verification history"
ON verification_history FOR SELECT
USING (auth.uid() IN (
  SELECT provider_id FROM food_listings WHERE id IN (
    SELECT listing_id FROM bids WHERE id IN (
      SELECT bid_id FROM deliveries WHERE id = verification_history.delivery_id
    )
  )
) OR auth.uid() = verified_by);
```

## 7. Notification System

### 7.1 Real-time Alerts
#### 7.1.1 Set up Supabase database triggers for notifications
```sql
-- notification function
CREATE OR REPLACE FUNCTION notify_new_bid()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (user_id, type, content, related_id)
  SELECT 
    provider_id, 
    'new_bid',
    format('New bid of ₹%s on your listing "%s"', NEW.amount, l.title),
    NEW.id
  FROM food_listings l
  WHERE l.id = NEW.listing_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- notification trigger
CREATE TRIGGER new_bid_alert
AFTER INSERT ON bids
FOR EACH ROW
EXECUTE PROCEDURE notify_new_bid();
```

#### 7.1.2 Create notification center component
```tsx
// components/notification-center.tsx
'use client'
import { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import { useSupabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([])
  const [unread, setUnread] = useState(0)
  const [open, setOpen] = useState(false)
  const { supabase, user } = useSupabase()
  
  useEffect(() => {
    if (!user) return
    
    // Fetch notifications
    const fetchNotifications = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)
      
      if (data) {
        setNotifications(data)
        setUnread(data.filter(n => !n.read).length)
      }
    }
    
    fetchNotifications()
    
    // Set up realtime subscription
    const channel = supabase.channel('notifications')
      .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
          payload => {
            setNotifications(prev => [payload.new, ...prev])
            setUnread(u => u + 1)
          })
      .subscribe()
      
    return () => { supabase.removeChannel(channel) }
  }, [user, supabase])
  
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative">
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>
      
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50">
          <div className="p-4 border-b">
            <h3 className="font-medium">Notifications</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={cn(
                    "p-3 border-b hover:bg-gray-50",
                    !notification.read && "bg-blue-50"
                  )}
                >
                  <p className="text-sm">{notification.content}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notification.created_at).toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="p-4 text-center text-gray-500">No notifications</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
```

#### 7.1.3 Implement WebSocket connections
```tsx
// lib/supabase/realtime.ts
import { createClient } from '@/lib/supabase/client'

export const setupRealtimeListeners = (userId: string, callbacks: {
  onNewNotification?: (notification: any) => void,
  onBidUpdate?: (bid: any) => void,
  onDeliveryUpdate?: (delivery: any) => void
}) => {
  const supabase = createClient()
  
  // Notification channel
  const notificationChannel = supabase.channel(`notifications:${userId}`)
    .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        payload => callbacks.onNewNotification?.(payload.new))
    .subscribe()
  
  // Bid updates channel
  const bidChannel = supabase.channel(`bids:${userId}`)
    .on('postgres_changes',
        { event: '*', schema: 'public', table: 'bids' },
        payload => callbacks.onBidUpdate?.(payload))
    .subscribe()
  
  // Delivery tracking channel
  const deliveryChannel = supabase.channel(`deliveries:${userId}`)
    .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'deliveries' },
        payload => callbacks.onDeliveryUpdate?.(payload.new))
    .subscribe()
  
  return () => {
    supabase.removeChannel(notificationChannel)
    supabase.removeChannel(bidChannel)
    supabase.removeChannel(deliveryChannel)
  }
}
```

#### 7.1.4 Add SMS integration using Twilio
```tsx
// lib/twilio.ts
import twilio from 'twilio'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

export const sendSMS = async (to: string, body: string) => {
  try {
    const message = await client.messages.create({
      body,
      to,
      from: process.env.TWILIO_PHONE_NUMBER
    })
    return { success: true, sid: message.sid }
  } catch (error) {
    return { success: false, error }
  }
}
```

### 7.2 Scheduled Notifications

#### 7.2.1 Configure cron jobs for expiration alerts
```tsx
// app/api/cron/expiring-listings/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { sendEmail } from '@/lib/resend'
import { ExpiringListingEmail } from '@/components/emails/expiring-listing'

export async function GET(req: Request) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
  
  // Find listings expiring in the next hour
  const { data: listings } = await supabase
    .from('food_listings')
    .select('*, user_profiles(email)')
    .eq('status', 'active')
    .gte('best_by', new Date().toISOString())
    .lte('best_by', new Date(Date.now() + 60 * 60 * 1000).toISOString())
  
  // Send notification emails
  const emailPromises = listings?.map(listing => 
    sendEmail({
      to: listing.user_profiles.email,
      subject: 'Your MealShare listing is expiring soon',
      react: ExpiringListingEmail({ listing })
    })
  ) || []
  
  await Promise.all(emailPromises)
  
  return Response.json({ success: true, sent: listings?.length || 0 })
}
```

#### 7.2.2 Build reminder email templates
```tsx
// components/emails/expiring-listing.tsx
import { Html, Head, Body, Container, Section, Heading, Text, Button } from '@react-email/components'

export function ExpiringListingEmail({ listing }) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'Arial, sans-serif' }}>
        <Container>
          <Section>
            <Heading>Your MealShare listing is expiring soon</Heading>
            <Text>
              Hi there,
            </Text>
            <Text>
              Your food listing "{listing.title}" will expire in less than an hour. If no one has 
              claimed this food yet, consider extending the expiration time or marking it as urgent.
            </Text>
            <Button
              href={`${process.env.NEXT_PUBLIC_APP_URL}/listings/${listing.id}`}
              style={{ background: '#4CAF50', color: 'white', padding: '12px 20px' }}
            >
              View Listing
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}
```

#### 7.2.3 Implement push notification system
```tsx
// lib/web-push.ts
import webpush from 'web-push'

webpush.setVapidDetails(
  'mailto:support@mealshare.org',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export const sendPushNotification = async (subscription, payload) => {
  try {
    await webpush.sendNotification(
      subscription,
      typeof payload === 'string' ? payload : JSON.stringify(payload)
    )
    return { success: true }
  } catch (error) {
    return { success: false, error }
  }
}
```

#### 7.2.4 Add notification preferences panel
```tsx
// components/notification-preferences.tsx
'use client'
import { useState, useEffect } from 'react'
import { useSupabase } from '@/lib/supabase/client'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'

export default function NotificationPreferences() {
  const { supabase, user } = useSupabase()
  const [preferences, setPreferences] = useState({
    email_new_bids: true,
    email_bid_accepted: true,
    sms_bid_accepted: false,
    push_urgent_listings: true,
    push_delivery_updates: true
  })
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchPreferences = async () => {
      if (!user) return
      
      const { data } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      if (data) {
        setPreferences(data)
      }
      setLoading(false)
    }
    
    fetchPreferences()
  }, [user, supabase])
  
  const savePreferences = async () => {
    setLoading(true)
    await supabase
      .from('notification_preferences')
      .upsert({ user_id: user.id, ...preferences })
    
    setLoading(false)
  }
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Notification Preferences</h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Email notifications for new bids</p>
            <p className="text-sm text-gray-500">Receive emails when someone bids on your listing</p>


## 8. Finalization & Deployment

### 8.1 Testing
8.1.1 End-to-end testing with Cypress

8.1.2 Load testing for bidding system

8.1.3 Payment flow security audit

8.1.4 Mobile responsiveness check

### 8.2 Deployment
8.2.1 Configure Vercel project settings

8.2.2 CI/CD pipeline with Supabase migrations:
```yaml
- run: supabase db push --linked
```

8.2.3 Implement monitoring with Sentry

8.2.4 Database backup strategy setup

## Dependency Flow (Updated)
- Supabase Auth → User Profiles → Food Listings
- Food Listings → Bidding → Payment Confirmation
- All Systems → Supabase Realtime Notifications

## Suggested Implementation Order
1. Phase 1.1 (Supabase Auth) → 1.2 (Database)
2. Phase 2 (User Profiles)
3. Phase 3 (Listings with Geolocation)
4. Phase 4 (Realtime Bidding)
5. Phase 5 (Payment Integration)
6. Phase 6 (Delivery Tracking)
7. Phase 7 (Supabase-powered Notifications)
8. Phase 8 (Deployment)