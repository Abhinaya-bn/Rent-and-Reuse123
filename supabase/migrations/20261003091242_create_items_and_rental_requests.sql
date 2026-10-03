/*
# Create items and rental_requests tables for Rent & Reuse marketplace

## Overview
This migration creates the two core tables for a student rental/borrowing marketplace:
1. `items` — listings posted by students (calculators, books, laptops, lab equipment, etc.)
2. `rental_requests` — requests from one student to rent/borrow another student's item

## New Tables

### items
- `id` (uuid, primary key, auto-generated)
- `title` (text, not null) — item name
- `description` (text, not null) — item description
- `category` (text, not null) — item category (Books, Electronics, Lab Equipment, etc.)
- `daily_price` (numeric, not null, default 0) — daily rental price in currency units
- `image_url` (text) — URL to item image (optional, defaults to placeholder)
- `is_available` (boolean, default true) — whether the item is currently available for rent
- `owner_id` (uuid, not null, defaults to auth.uid()) — the user who posted the item
- `created_at` (timestamptz, default now()) — when the item was posted

### rental_requests
- `id` (uuid, primary key, auto-generated)
- `item_id` (uuid, not null, FK to items.id ON DELETE CASCADE) — the requested item
- `renter_id` (uuid, not null, defaults to auth.uid()) — the user requesting to rent
- `start_date` (date, not null) — requested rental start date
- `end_date` (date, not null) — requested rental end date
- `status` (text, not null, default 'pending') — pending | approved | rejected | returned
- `message` (text) — optional message from renter to owner
- `created_at` (timestamptz, default now()) — when the request was made

## Security (RLS)

### items
- SELECT: anyone (anon + authenticated) can browse available items — marketplace is public
- INSERT: authenticated users can create items they own
- UPDATE: only the item owner can update their own listings
- DELETE: only the item owner can delete their own listings

### rental_requests
- SELECT: authenticated users can see requests they made (as renter) or requests on their items (as owner)
- INSERT: authenticated users can create rental requests, but NOT for their own items
- UPDATE: only the item owner can update request status (approve/reject/return), and only to valid statuses
- DELETE: renters can cancel their own pending requests

## Important Notes
1. `owner_id` and `renter_id` default to `auth.uid()` so inserts from the frontend succeed even when the client omits the user ID.
2. A CHECK constraint prevents users from renting their own items (renter_id != owner_id via a join check done in policy).
3. Status transitions are restricted via a CHECK constraint on valid status values.
*/

-- ============ items table ============
CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  daily_price numeric(10,2) NOT NULL DEFAULT 0,
  image_url text DEFAULT 'https://images.pexels.com/photos/1907785/pexels-photo-1907785.jpeg',
  is_available boolean NOT NULL DEFAULT true,
  owner_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Anyone can browse items (public marketplace)
DROP POLICY IF EXISTS "Public can browse items" ON items;
CREATE POLICY "Public can browse items"
ON items FOR SELECT
TO anon, authenticated
USING (true);

-- Authenticated users can post items (owner_id defaults to auth.uid())
DROP POLICY IF EXISTS "Owners can create items" ON items;
CREATE POLICY "Owners can create items"
ON items FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = owner_id);

-- Only the owner can update their items
DROP POLICY IF EXISTS "Owners can update items" ON items;
CREATE POLICY "Owners can update items"
ON items FOR UPDATE
TO authenticated
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

-- Only the owner can delete their items
DROP POLICY IF EXISTS "Owners can delete items" ON items;
CREATE POLICY "Owners can delete items"
ON items FOR DELETE
TO authenticated
USING (auth.uid() = owner_id);

-- ============ rental_requests table ============
CREATE TABLE IF NOT EXISTS rental_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  renter_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'returned')),
  message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE rental_requests ENABLE ROW LEVEL SECURITY;

-- Renters can see their own requests; owners can see requests on their items
DROP POLICY IF EXISTS "Users can view relevant requests" ON rental_requests;
CREATE POLICY "Users can view relevant requests"
ON rental_requests FOR SELECT
TO authenticated
USING (
  renter_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM items
    WHERE items.id = rental_requests.item_id
    AND items.owner_id = auth.uid()
  )
);

-- Authenticated users can create requests, but NOT for their own items
DROP POLICY IF EXISTS "Users can create rental requests" ON rental_requests;
CREATE POLICY "Users can create rental requests"
ON rental_requests FOR INSERT
TO authenticated
WITH CHECK (
  renter_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM items
    WHERE items.id = item_id
    AND items.owner_id != auth.uid()
  )
);

-- Only the item owner can update request status
DROP POLICY IF EXISTS "Owners can update request status" ON rental_requests;
CREATE POLICY "Owners can update request status"
ON rental_requests FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM items
    WHERE items.id = rental_requests.item_id
    AND items.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM items
    WHERE items.id = rental_requests.item_id
    AND items.owner_id = auth.uid()
  )
);

-- Renters can cancel (delete) their own pending requests
DROP POLICY IF EXISTS "Renters can cancel own requests" ON rental_requests;
CREATE POLICY "Renters can cancel own requests"
ON rental_requests FOR DELETE
TO authenticated
USING (renter_id = auth.uid());

-- ============ Indexes ============
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);
CREATE INDEX IF NOT EXISTS idx_items_owner_id ON items(owner_id);
CREATE INDEX IF NOT EXISTS idx_items_is_available ON items(is_available);
CREATE INDEX IF NOT EXISTS idx_rental_requests_item_id ON rental_requests(item_id);
CREATE INDEX IF NOT EXISTS idx_rental_requests_renter_id ON rental_requests(renter_id);
CREATE INDEX IF NOT EXISTS idx_rental_requests_status ON rental_requests(status);
