-- Criar bucket para imagens de blog
-- Execute isto manualmente no Supabase:
-- 1. Vá em Storage
-- 2. Clique em "New Bucket"
-- 3. Nome: "blog-images"
-- 4. Public bucket: YES
-- 5. Create bucket

-- Depois execute este SQL para as políticas:

-- Políticas para o bucket blog-images
CREATE POLICY "Blog images are publicly readable"
ON storage.objects
FOR SELECT
USING (bucket_id = 'blog-images');

CREATE POLICY "Authenticated users can upload blog images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'blog-images'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete their blog images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'blog-images'
  AND auth.role() = 'authenticated'
);
