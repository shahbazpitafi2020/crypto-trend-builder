
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'editor');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles without recursion
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- user_roles policies
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Update posts policies: drop old ones, create role-based ones
DROP POLICY IF EXISTS "Users can create posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can view their own posts" ON public.posts;

-- Admins can do everything on posts
CREATE POLICY "Admins can manage all posts"
ON public.posts FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Editors can create drafts (published must be false)
CREATE POLICY "Editors can create drafts"
ON public.posts FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'editor')
  AND auth.uid() = user_id
  AND published = false
);

-- Editors can view their own posts
CREATE POLICY "Editors can view own posts"
ON public.posts FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'editor')
  AND auth.uid() = user_id
);

-- Editors can update their own unpublished posts (cannot set published=true)
CREATE POLICY "Editors can update own drafts"
ON public.posts FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'editor')
  AND auth.uid() = user_id
  AND published = false
)
WITH CHECK (
  public.has_role(auth.uid(), 'editor')
  AND auth.uid() = user_id
  AND published = false
);

-- Editors can delete their own unpublished posts
CREATE POLICY "Editors can delete own drafts"
ON public.posts FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'editor')
  AND auth.uid() = user_id
  AND published = false
);
