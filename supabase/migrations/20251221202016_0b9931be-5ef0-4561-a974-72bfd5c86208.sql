-- 1. Update the bucket to be public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'exercise_images';

-- 2. Drop the restrictive SELECT policy
DROP POLICY IF EXISTS "Users can view own exercise images" ON storage.objects;

-- 3. Create a public SELECT policy for anyone to view
CREATE POLICY "Anyone can view exercise images"
ON storage.objects FOR SELECT
USING (bucket_id = 'exercise_images');