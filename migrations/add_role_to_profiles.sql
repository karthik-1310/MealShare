-- Add role column to profiles table
ALTER TABLE public.profiles
ADD COLUMN role VARCHAR(10) CHECK (role IN ('provider', 'ngo', 'individual'));

-- Update RLS policies to allow role updates
CREATE POLICY "Users can update their own role"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id); 