-- Reset the schema (Optional - be VERY careful with this on production!)
-- TRUNCATE TABLE gemachs RESTART IDENTITY CASCADE;
-- TRUNCATE TABLE gemach_images RESTART IDENTITY CASCADE;

-- Create or replace the 'gemachs' table
CREATE TABLE IF NOT EXISTS public.gemachs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  address TEXT NOT NULL,
  location_instructions TEXT,
  phone TEXT NOT NULL,
  manager_phone TEXT,
  email TEXT,
  description TEXT NOT NULL,
  hours TEXT NOT NULL,
  has_fee BOOLEAN DEFAULT FALSE,
  fee_details TEXT,
  website_url TEXT,
  facebook_url TEXT,
  owner_id UUID REFERENCES auth.users(id),
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Create or replace the 'gemach_images' table
CREATE TABLE IF NOT EXISTS public.gemach_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gemach_id UUID REFERENCES public.gemachs(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the 'profiles' table for user details if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  neighborhood TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add a function to check if the current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN
  -- Check if the user's email is in the admin list or has is_admin flag in metadata
  SELECT EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE id = auth.uid() AND (
      -- Check user_metadata for is_admin flag
      (user_metadata->>'is_admin')::BOOLEAN = TRUE 
      OR
      -- Or check the profiles table for is_admin flag
      EXISTS (
        SELECT 1 
        FROM public.profiles 
        WHERE id = auth.uid() AND is_admin = TRUE
      )
      OR
      -- Or check if email is in the admin list
      email = 'zaviner@gmail.com'
    )
  ) INTO is_admin;
  
  RETURN COALESCE(is_admin, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to make a user an admin
CREATE OR REPLACE FUNCTION public.set_user_admin(user_email TEXT, admin_status BOOLEAN)
RETURNS BOOLEAN AS $$
DECLARE
  target_user_id UUID;
  success BOOLEAN := FALSE;
BEGIN
  -- Check if current user is admin (only admins can make other users admins)
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only administrators can perform this action';
    RETURN FALSE;
  END IF;
  
  -- Get the user ID from the email
  SELECT id INTO target_user_id FROM auth.users WHERE email = user_email;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
    RETURN FALSE;
  END IF;
  
  -- Update the user's profile
  UPDATE public.profiles 
  SET is_admin = admin_status,
      updated_at = NOW()
  WHERE id = target_user_id;
  
  success := TRUE;
  RETURN success;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set up RLS (Row Level Security)
-- Enable RLS on tables
ALTER TABLE public.gemachs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gemach_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for gemachs table
-- 1. Select policy (anyone can view published and approved gemachs)
DROP POLICY IF EXISTS "Anyone can view approved gemachs" ON public.gemachs;
CREATE POLICY "Anyone can view approved gemachs" 
ON public.gemachs FOR SELECT 
USING (is_approved = TRUE OR auth.uid() = owner_id OR public.is_admin());

-- 2. Insert policy (authenticated users can create new gemachs)
DROP POLICY IF EXISTS "Authenticated users can create gemachs" ON public.gemachs;
CREATE POLICY "Authenticated users can create gemachs" 
ON public.gemachs FOR INSERT 
TO authenticated
WITH CHECK (true);

-- 3. Update policy (users can update their own gemachs, admins can update any)
DROP POLICY IF EXISTS "Users can update own gemachs" ON public.gemachs;
CREATE POLICY "Users can update own gemachs or admins can update any" 
ON public.gemachs FOR UPDATE 
USING (auth.uid() = owner_id OR public.is_admin());

-- 4. Delete policy (users can delete their own gemachs, admins can delete any)
DROP POLICY IF EXISTS "Users can delete own gemachs" ON public.gemachs;
CREATE POLICY "Users can delete own gemachs or admins can delete any" 
ON public.gemachs FOR DELETE 
USING (auth.uid() = owner_id OR public.is_admin());

-- Create policies for gemach_images table
-- 1. Select policy (anyone can view images of approved gemachs)
DROP POLICY IF EXISTS "Anyone can view gemach images" ON public.gemach_images;
CREATE POLICY "Anyone can view gemach images" 
ON public.gemach_images FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.gemachs g 
  WHERE g.id = gemach_id AND (g.is_approved = TRUE OR auth.uid() = g.owner_id OR public.is_admin())
));

-- 2. Insert policy (authenticated users can add images to their gemachs)
DROP POLICY IF EXISTS "Users can add images to own gemachs" ON public.gemach_images;
CREATE POLICY "Users can add images to own gemachs or admins can add to any" 
ON public.gemach_images FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.gemachs g 
    WHERE g.id = gemach_id AND (auth.uid() = g.owner_id OR public.is_admin())
  )
);

-- 3. Delete policy (users can delete images from their own gemachs)
DROP POLICY IF EXISTS "Users can delete own gemach images" ON public.gemach_images;
CREATE POLICY "Users can delete own gemach images or admins can delete any" 
ON public.gemach_images FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.gemachs g 
    WHERE g.id = gemach_id AND (auth.uid() = g.owner_id OR public.is_admin())
  )
);

-- Policies for profiles table
CREATE POLICY "Users can view any profile" 
ON public.profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id OR public.is_admin());

-- Trigger to create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, is_admin)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name'), 
    NEW.email,
    -- Set admin status if email matches or metadata has is_admin flag
    CASE 
      WHEN NEW.email = 'zaviner@gmail.com' OR (NEW.raw_user_meta_data->>'is_admin')::BOOLEAN = TRUE THEN TRUE 
      ELSE FALSE 
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Give public access to these tables
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gemachs TO authenticated;
GRANT SELECT ON public.gemachs TO anon;
GRANT SELECT, INSERT, DELETE ON public.gemach_images TO authenticated;
GRANT SELECT ON public.gemach_images TO anon;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

-- Grant access to the admin functions
GRANT EXECUTE ON FUNCTION public.is_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_user_admin TO authenticated; 