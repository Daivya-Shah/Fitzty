-- Add beard_length column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN beard_length TEXT;

-- Update the body_details_timestamp trigger to include beard_length
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
      OLD.weight IS DISTINCT FROM NEW.weight OR
      OLD.beard_length IS DISTINCT FROM NEW.beard_length) THEN
    NEW.body_details_updated_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql; 