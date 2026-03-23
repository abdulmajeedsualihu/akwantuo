-- Drop existing strict policies if needed (or just add a new one)
-- The initial migration had:
-- INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated')

-- We add a policy for anonymous users to upload
DROP POLICY IF EXISTS "Anyone can upload to product-images" ON storage.objects;
CREATE POLICY "Anyone can upload to product-images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images');

-- Ensure anyone can also read (already exists, but better confirm)
-- SELECT USING (bucket_id = 'product-images')
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'Public Access to product-images'
    ) THEN
        CREATE POLICY "Public Access to product-images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
    END IF;
END $$;
