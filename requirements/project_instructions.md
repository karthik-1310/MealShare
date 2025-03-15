# Project Overview
**MealShare** - "Feeding Hope, One Meal at a Time"  
A platform connecting restaurants/food providers with NGOs/welfare organizations to distribute surplus food via a bidding system. Built with:  
- **Next.js** (App Router)  
- **shadcn/ui** for components  
- **Clerk** for authentication  
- **Supabase** for database  
- **Lucide** for icons  
- Tailwind CSS, Framer Motion, and TypeScript.

---

# Feature Requirements
### Authentication & User Management (Clerk + Supabase)
1. **Sign-in/Sign-up Flow**  
   - Integrate Google OAuth and Email/Password auth via Clerk.  
   - Connect Clerk auth to Supabase user profiles (sync user data).  
   - OTP verification for email sign-ups.  
   - Role-based access control (food providers vs. NGOs/individuals).  

2. **Database Requirements (Supabase)**  
   - `users` table linked to Clerk auth IDs.  
   - `food_listings` (title, description, expiry, images, min_bid).  
   - `bids` table (listing_id, bid_amount, bidder_id, timestamp).  
   - `organizations` table for NGOs/restaurants.  

3. **Frontend Integration**  
   - Protect routes based on auth state.  
   - Post-auth redirect logic (e.g., NGOs to bidding dashboard).  
   - Profile completion form for new users.  

---

# Relevant Docs
- [Clerk Authentication Setup](https://clerk.com/docs/nextjs/quickstart)  
- [Supabase JS Library](https://supabase.com/docs/reference/javascript/introduction)  
- [Next.js App Router](https://nextjs.org/docs/app)  
- [shadcn/ui Components](https://ui.shadcn.com/docs)  
- [Lucide Icons](https://lucide.dev/icons/)  

---

# Current File Structure
```
MealShare/
├── package.json
├── package-lock.json
├── node_modules/
└── my-app/
    ├── app/
    │   ├── verify-otp/       # OTP verification page
    │   ├── signup/           # Sign-up page (to integrate with Clerk)
    │   ├── login/            # Login page (to integrate with Clerk)
    │   ├── layout.tsx        # Root layout
    │   ├── page.tsx          # Homepage
    │   └── globals.css       # Global styles
    ├── components/
    │   ├── ui/               # shadcn/ui components
    │   ├── theme-toggle.tsx  # Dark/light mode switch
    │   └── food-listing-card.tsx # Food card component (connect to Supabase)
    ├── lib/
    │   └── supabase.ts       # Supabase client setup (to be created)
    ├── public/               # Static assets
    ├── tailwind.config.ts
    ├── next.config.ts
    └── types/                # TypeScript types (to be added)
```

---

# MealShare Implementation Roadmap

**Methodology**: Agile (Sprints) + Waterfall (for Payment/Delivery Modules)  
**Tech Stack**: Next.js, Clerk (Auth), Supabase (DB + Realtime), Razorpay (Payments), React-Email, Mapbox (Tracking)

## Phase 1: Core Authentication & User Management (Sprint 1)

### 1.1 Clerk Integration

```tsx
// my-app/app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      signInUrl="/login"
    >
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
```

### 1.2 Supabase User Sync

```sql
-- Supabase SQL for users table
CREATE TABLE users (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  role VARCHAR(10) NOT NULL CHECK (role IN ('provider', 'ngo', 'individual')),
  phone VARCHAR(15),
  org_id UUID REFERENCES organizations,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
```

### 1.3 Auth Flow

- Implement Clerk's `<SignIn/>` and `<SignUp/>` in `/login` & `/signup`
- Add post-auth webhook to create Supabase user profile
- Role-based routing (Providers → `/dashboard`, NGOs → `/bids`)

## Phase 2: Food Listing & Bidding System (Sprint 2)

### 2.1 Database Schema

```sql
CREATE TABLE food_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID REFERENCES auth.users NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  best_by TIMESTAMPTZ NOT NULL,
  images TEXT[],
  min_bid NUMERIC,
  is_urgent BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'active' 
    CHECK (status IN ('active', 'accepted', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE bids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES food_listings NOT NULL,
  bidder_id UUID REFERENCES auth.users NOT NULL,
  amount NUMERIC NOT NULL,
  is_accepted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2.2 Key Features Implementation

**Urgent Pickup Alerts**:

```ts
// Supabase realtime subscription
const listings = supabase
  .channel('urgent-listings')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'food_listings',
    filter: 'is_urgent=eq.true'
  }, handleNewUrgentListing)
  .subscribe()
```

**Bid Ranking System**:

```sql
-- Get bids for a listing
SELECT * FROM bids 
WHERE listing_id = :listingId 
ORDER BY amount DESC, created_at ASC;
```

**Bid Acceptance Flow**:

```ts
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

## Phase 3: Payment & Order Confirmation (Sprint 3)

### 3.1 Payment Gateway Selection

**Recommended**: Razorpay (Best for India)  
**Alternative**: Stripe (Global)

**Why Razorpay**:
- UPI/NetBanking support
- Prebuilt UI components
- Compliance with Indian payment regulations

### 3.2 Payment Flow

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
};
```

### 3.3 Confirmation Window System

```ts
// Supabase function for confirmation expiry
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

## Phase 4: Delivery Tracking & Notifications (Sprint 4)

### 4.1 Real-time Tracking

```tsx
// components/delivery-tracker.tsx
import { useSupabaseRealtime } from '@/lib/supabase';

const DeliveryTracker = ({ orderId }) => {
  const [status, setStatus] = useState('');
  
  useSupabaseRealtime()
    .channel(`order:${orderId}`)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'deliveries',
      filter: `order_id=eq.${orderId}`
    }, (payload) => {
      setStatus(payload.new.status);
    });
  
  return <ProgressBar status={status} />;
};
```

### 4.2 Notification System

```sql
-- Expiration alert cron job
select cron.schedule(
  'check-expiring-listings',
  '*/5 * * * *', -- Every 5 minutes
  $$
  notify expiring_listings,
    (select json_agg(id) 
     from food_listings 
     where best_by < now() + interval '1 hour')
  $$
);
```

## Phase 5: Advanced Features (Sprint 5)

### 5.1 Cancellation Fee System

```ts
// API route for cancellations
export async function POST(req: Request) {
  const { cancellation } = await req.json();
  
  if (cancellation.is_late) {
    const payment = await chargeCancellationFee(
      cancellation.user_id,
      cancellation.amount
    );
    
    await supabase
      .from('cancellations')
      .insert({
        ...cancellation,
        fee_charged: payment.amount
      });
  }
}
```

### 5.2 QR Authentication

```tsx
// components/qr-scanner.tsx
import { QrReader } from 'react-qr-reader';

const QRScanner = () => {
  const handleScan = (data: string | null) => {
    if (data) {
      const [userId, listingId] = data.split(':');
      verifyPickupAuthorization(userId, listingId);
    }
  };

  return <QrReader onResult={handleScan} />;
};
```

## Project Management Tools

**Task Tracking**: GitHub Projects + Issues

**CI/CD**: GitHub Actions for:

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: supabase/setup-cli@v1
      - run: supabase db push --linked
      - uses: Vercel/actions@v1
```

**Error Monitoring**: Sentry.io

**API Documentation**: Postman Collections

## Implementation Sequence

1. Set up Clerk auth with role-based access
2. Create core Supabase tables
3. Implement bidding system with real-time updates
4. Integrate Razorpay payment gateway
5. Build confirmation window system
6. Add delivery tracking with Mapbox
7. Implement cancellation fees & backup plans
8. Add QR authentication flow
9. Set up cron jobs for notifications
10. Final testing & security audit

## Critical Path Items

- **Payment Gateway Compliance**: Ensure PCI-DSS compliance
- **Realtime Sync Testing**: Load test Supabase channels
- **Confirmation Window Timer**: Atomic clock sync
- **Geospatial Queries**: Optimize for nearby listings