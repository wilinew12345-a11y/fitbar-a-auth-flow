-- Create the exercise-attachments bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('exercise-attachments', 'exercise-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist and recreate
DROP POLICY IF EXISTS "Public Access for exercise-attachments" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload for exercise-attachments" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete for exercise-attachments" ON storage.objects;

-- Set up access policies
CREATE POLICY "Public Access for exercise-attachments" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'exercise-attachments');

CREATE POLICY "Authenticated Upload for exercise-attachments" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'exercise-attachments' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated Delete for exercise-attachments" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'exercise-attachments' AND auth.role() = 'authenticated');