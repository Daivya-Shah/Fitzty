-- Add body details columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN gender TEXT,
ADD COLUMN skin_tone TEXT,
ADD COLUMN face_shape TEXT,
ADD COLUMN hair_type TEXT,
ADD COLUMN hair_length TEXT,
ADD COLUMN hair_color TEXT,
ADD COLUMN eye_shape TEXT,
ADD COLUMN eye_color TEXT,
ADD COLUMN body_build TEXT,
ADD COLUMN height TEXT,
ADD COLUMN weight TEXT,
ADD COLUMN profile_picture_type TEXT DEFAULT 'upload', -- 'upload' or 'ai'
ADD COLUMN body_details_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create wardrobe_items table
CREATE TABLE public.wardrobe_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  description TEXT,
  clothing_type TEXT,
  brand TEXT,
  size TEXT,
  upload_type TEXT DEFAULT 'normal', -- 'normal' or 'ai'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create brands table for predefined brand list
CREATE TABLE public.brands (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert some common brands
INSERT INTO public.brands (name) VALUES 
('Nike'),
('Adidas'),
('Zara'),
('H&M'),
('Uniqlo'),
('Gap'),
('Levi''s'),
('Calvin Klein'),
('Tommy Hilfiger'),
('Ralph Lauren'),
('Gucci'),
('Prada'),
('Louis Vuitton'),
('Chanel'),
('Dior'),
('Versace'),
('Armani'),
('Dolce & Gabbana'),
('Burberry'),
('Other');

-- Enable RLS on wardrobe_items
ALTER TABLE public.wardrobe_items ENABLE ROW LEVEL SECURITY;

-- Create policies for wardrobe_items
CREATE POLICY "Users can view their own wardrobe items" 
ON public.wardrobe_items 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own wardrobe items" 
ON public.wardrobe_items 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wardrobe items" 
ON public.wardrobe_items 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wardrobe items" 
ON public.wardrobe_items 
FOR DELETE 
USING (auth.uid() = user_id);

-- Enable RLS on brands table and make it publicly readable
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Brands are viewable by everyone" 
ON public.brands 
FOR SELECT 
USING (true);

-- Create trigger for wardrobe_items updated_at
CREATE TRIGGER update_wardrobe_items_updated_at
BEFORE UPDATE ON public.wardrobe_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for profiles body_details_updated_at
CREATE OR REPLACE FUNCTION public.update_body_details_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update timestamp if body detail fields are changed
  IF (OLD.gender IS DISTINCT FROM NEW.gender OR
      OLD.skin_tone IS DISTINCT FROM NEW.skin_tone OR
      OLD.face_shape IS DISTINCT FROM NEW.face_shape OR
      OLD.hair_type IS DISTINCT FROM NEW.hair_type OR
      OLD.hair_length IS DISTINCT FROM NEW.hair_length OR
      OLD.hair_color IS DISTINCT FROM NEW.hair_color OR
      OLD.eye_shape IS DISTINCT FROM NEW.eye_shape OR
      OLD.eye_color IS DISTINCT FROM NEW.eye_color OR
      OLD.body_build IS DISTINCT FROM NEW.body_build OR
      OLD.height IS DISTINCT FROM NEW.height OR
      OLD.weight IS DISTINCT FROM NEW.weight) THEN
    NEW.body_details_updated_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_body_details_timestamp
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_body_details_timestamp();