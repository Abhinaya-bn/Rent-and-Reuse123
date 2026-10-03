/*
# Add image storage support for items

## Overview
This migration adds multi-image support to the existing `items` table and creates a Supabase Storage bucket for uploading item images.

## Changes

### 1. New Column on `items` table
- `image_urls` (jsonb, default '[]') — Array of public image URLs for the item. Supports up to 5 images. The existing `image_url` column is preserved for backward compatibility; `image_urls` is the primary source when present.

### 2. New Storage Bucket
- `item-images` — public bucket for storing item images
  - File size limit: 5MB
  - Allowed MIME types: image/jpeg, image/png, image/webp

### 3. Storage Policies (on storage.objects)
- SELECT: Anyone (anon + authenticated) can read images — public bucket
- INSERT: Authenticated users can upload images to the bucket
- DELETE: Users can delete only their own uploaded images (owner = auth.uid())
- UPDATE: Users can update only their own uploaded images

## Important Notes
1. The existing `image_url` column is NOT modified or removed — existing data is preserved.
2. The `image_urls` column defaults to an empty array, so existing rows are unaffected.
3. Storage policies use the built-in `owner` column on `storage.objects` which is automatically set to `auth.uid()` on insert.
4. This migration is idempotent — safe to re-run.
*/

-- ============ Add image_urls column to items ============
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'items' AND column_name = 'image_urls'
  ) THEN
    ALTER TABLE items ADD COLUMN image_urls jsonb NOT NULL DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- ============ Create item-images storage bucket ============
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'item-images',
  'item-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- ============ Storage policies for item-images bucket ============

-- Anyone can read item images (public bucket)
DROP POLICY IF EXISTS "Public can read item images" ON storage.objects;
CREATE POLICY "Public can read item images"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'item-images');

-- Authenticated users can upload to item-images
DROP POLICY IF EXISTS "Authenticated can upload item images" ON storage.objects;
CREATE POLICY "Authenticated can upload item images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'item-images');

-- Users can delete their own uploaded images
DROP POLICY IF EXISTS "Users can delete own item images" ON storage.objects;
CREATE POLICY "Users can delete own item images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'item-images' AND owner = auth.uid());

-- Users can update their own uploaded images
DROP POLICY IF EXISTS "Users can update own item images" ON storage.objects;
CREATE POLICY "Users can update own item images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'item-images' AND owner = auth.uid())
WITH CHECK (bucket_id = 'item-images');
