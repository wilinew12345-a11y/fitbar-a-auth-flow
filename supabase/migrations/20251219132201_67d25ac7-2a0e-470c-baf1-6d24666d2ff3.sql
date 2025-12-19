-- Fix security issue: Make exercise_images bucket private with user-scoped policies

-- Make bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'exercise_images';

-- Drop existing open policies
DROP POLICY IF EXISTS "Give users access to own folder 1bk022_0" ON storage.objects;
DROP POLICY IF EXISTS "Give users access to own folder 1bk022_1" ON storage.objects;

-- Create user-scoped SELECT policy
CREATE POLICY "Users can view own exercise images"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'exercise_images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Create user-scoped INSERT policy
CREATE POLICY "Users can upload own exercise images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'exercise_images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Create user-scoped UPDATE policy
CREATE POLICY "Users can update own exercise images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'exercise_images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Create user-scoped DELETE policy
CREATE POLICY "Users can delete own exercise images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'exercise_images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);