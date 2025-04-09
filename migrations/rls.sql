-- Enable Row Level Security on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- USER PROFILES POLICIES
-- Allow users to read their own profile
CREATE POLICY user_profiles_select_own ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile  
CREATE POLICY user_profiles_update_own ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow inserting only own profile
CREATE POLICY user_profiles_insert_own ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- FOOD LISTINGS POLICIES
-- Anyone can view active food listings
CREATE POLICY food_listings_select_active ON food_listings
  FOR SELECT USING (status = 'active');

-- Providers can view all their own listings regardless of status
CREATE POLICY food_listings_select_own ON food_listings
  FOR SELECT USING (auth.uid() = provider_id);

-- Providers can only insert their own listings
CREATE POLICY food_listings_insert_own ON food_listings
  FOR INSERT WITH CHECK (auth.uid() = provider_id);

-- Providers can update only their own listings
CREATE POLICY food_listings_update_own ON food_listings
  FOR UPDATE USING (auth.uid() = provider_id);

-- BIDS POLICIES
-- Bidders can view their own bids
CREATE POLICY bids_select_own ON bids
  FOR SELECT USING (auth.uid() = bidder_id);

-- Listing providers can view bids on their listings
CREATE POLICY bids_select_provider ON bids
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM food_listings
      WHERE food_listings.id = bids.listing_id
      AND food_listings.provider_id = auth.uid()
    )
  );

-- Bidders can insert their own bids
CREATE POLICY bids_insert_own ON bids
  FOR INSERT WITH CHECK (auth.uid() = bidder_id);

-- Bidders can update only their own bids that are still pending
CREATE POLICY bids_update_own ON bids
  FOR UPDATE USING (
    auth.uid() = bidder_id AND 
    status = 'pending'
  );

-- Providers can update bid status on their listings
CREATE POLICY bids_update_provider ON bids
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM food_listings
      WHERE food_listings.id = bids.listing_id
      AND food_listings.provider_id = auth.uid()
    )
  ) WITH CHECK (
    NEW.status IN ('accepted', 'rejected') AND
    OLD.status = 'pending'
  );

-- ORDERS POLICIES
-- Recipients can view their own orders
CREATE POLICY orders_select_recipient ON orders
  FOR SELECT USING (auth.uid() = recipient_id);

-- Providers can view orders for their listings
CREATE POLICY orders_select_provider ON orders
  FOR SELECT USING (auth.uid() = provider_id);

-- NOTIFICATIONS POLICIES
-- Users can only view their own notifications
CREATE POLICY notifications_select_own ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only update their own notifications (to mark as read)
CREATE POLICY notifications_update_own ON notifications
  FOR UPDATE USING (auth.uid() = user_id); 