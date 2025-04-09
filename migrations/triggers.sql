-- Function to handle new user creation and automatically create a profile
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Extract role from metadata or default to 'individual'
  INSERT INTO user_profiles (id, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'individual')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create a profile when a new user signs up
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to handle food listing expiration
CREATE OR REPLACE FUNCTION handle_listing_expiration() 
RETURNS TRIGGER AS $$
DECLARE
  listing_id UUID;
  provider_id UUID;
  listing_title TEXT;
BEGIN
  -- Check if best_by date has passed
  IF NEW.best_by < NOW() AND NEW.status = 'active' THEN
    -- Set variables from the NEW row
    listing_id := NEW.id;
    provider_id := NEW.provider_id;
    listing_title := NEW.title;
    
    -- Update status
    NEW.status := 'expired';
    
    -- Insert notification for the provider
    INSERT INTO notifications (
      user_id, 
      title, 
      message, 
      type, 
      related_id
    ) VALUES (
      provider_id,
      'Listing Expired',
      'Your food listing "' || listing_title || '" has expired.',
      'listing_expired',
      listing_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically expire listings when best_by date passes
CREATE TRIGGER check_listing_expiration
BEFORE UPDATE ON food_listings
FOR EACH ROW EXECUTE FUNCTION handle_listing_expiration();

-- Function to handle notifications on bid creation
CREATE OR REPLACE FUNCTION handle_new_bid()
RETURNS TRIGGER AS $$
DECLARE
  listing_title TEXT;
  provider_id UUID;
BEGIN
  -- Get listing information
  SELECT title, provider_id INTO listing_title, provider_id
  FROM food_listings
  WHERE id = NEW.listing_id;
  
  -- Create notification for the provider
  INSERT INTO notifications (
    user_id,
    title,
    message,
    type,
    related_id
  ) VALUES (
    provider_id,
    'New Bid Received',
    'You received a new bid on your listing "' || listing_title || '"',
    'new_bid',
    NEW.id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to notify on new bids
CREATE TRIGGER on_new_bid
AFTER INSERT ON bids
FOR EACH ROW EXECUTE FUNCTION handle_new_bid(); 