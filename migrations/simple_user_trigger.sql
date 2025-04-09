-- Function to handle new user creation and automatically create a profile
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create a default profile
  INSERT INTO user_profiles (id, role)
  VALUES (NEW.id, 'individual');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically create a profile when a new user signs up
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user(); 