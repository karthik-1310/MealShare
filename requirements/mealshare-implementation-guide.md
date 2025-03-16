# MealShare Implementation Sequence (Supabase Edition)

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

1.1.3 Create custom SignIn/SignUp pages using Supabase methods

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

1.2.2 Create lib/supabase.ts client initialization

1.2.3 Build core tables:
```sql
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  role VARCHAR(10) NOT NULL CHECK (role IN ('provider', 'ngo', 'individual')),
  phone VARCHAR(15),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE food_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID REFERENCES auth.users NOT NULL,
  title VARCHAR(100) NOT NULL,
  best_by TIMESTAMPTZ NOT NULL,
  location GEOGRAPHY(POINT)
);

CREATE TABLE bids (...);
```

1.2.4 Enable Row Level Security (RLS) with policies

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

3.1.3 Implement image upload using Supabase Storage

3.1.4 Add "Urgent Pickup" toggle with geolocation

### 3.2 Listing Display System
3.2.1 Build components/food-listing-card.tsx

3.2.2 Create auto-refresh carousel for urgent listings

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

4.1.3 Build bid history table with sorting

4.1.4 Realtime bid updates:
```ts
const bidsChannel = supabase.channel('bids-channel')
  .on('postgres_changes', { event: 'INSERT' }, handleNewBid)
  .subscribe()
```

### 4.2 Bid Management
4.2.1 Create provider's bid review interface

4.2.2 Implement bid acceptance API endpoint

4.2.3 Add confirmation modal for bid acceptance

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

5.1.3 Build components/payment-button.tsx

5.1.4 Implement payment verification webhook

### 5.2 Confirmation Workflow
5.2.1 Create 30-minute countdown timer component

5.2.2 Implement confirmation status tracking

5.2.3 Build cancellation fee calculation system

5.2.4 Add backup bid fallback mechanism

## 6. Delivery Management

### 6.1 Tracking System
6.1.1 Integrate Mapbox GL JS

6.1.2 Create delivery status update endpoints

6.1.3 Build realtime tracking interface:
```tsx
const channel = supabase.channel('location-updates')
  .on('postgres_changes', { event: 'UPDATE' }, updateLocation)
  .subscribe()
```

6.1.4 Implement driver assignment logic

### 6.2 Pickup Verification
6.2.1 Create QR generation endpoint

6.2.2 Build scanner component with react-qr-reader

6.2.3 Implement pickup confirmation API

6.2.4 Add verification history tracking

## 7. Notification System

### 7.1 Real-time Alerts
7.1.1 Set up Supabase database triggers for notifications:
```sql
CREATE TRIGGER new_bid_alert
AFTER INSERT ON bids
FOR EACH ROW EXECUTE PROCEDURE notify_new_bid();
```

7.1.2 Create notification center component

7.1.3 Implement WebSocket connections

7.1.4 Add SMS integration using Twilio

### 7.2 Scheduled Notifications
7.2.1 Configure cron jobs for expiration alerts

7.2.2 Build reminder email templates

7.2.3 Implement push notification system

7.2.4 Add notification preferences panel

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