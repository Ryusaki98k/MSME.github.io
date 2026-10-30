-- Supabase Schema for MSME News Backend
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===== Admin Check Function (bypasses RLS) =====
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admins
    WHERE admins.email = auth.email()
  );
$$;

-- ===== Posts Table =====
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    summary TEXT,
    content TEXT,
    category TEXT NOT NULL DEFAULT 'ข่าวประชาสัมพันธ์',
    cover_image TEXT,
    album_id UUID,
    post_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    post_date_end TIMESTAMPTZ,
    publish_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_publish_at ON posts(publish_at);
CREATE INDEX idx_posts_post_date ON posts(post_date DESC);
CREATE INDEX idx_posts_is_pinned ON posts(is_pinned);
CREATE INDEX idx_posts_category ON posts(category);
CREATE INDEX idx_posts_slug ON posts(slug);

-- ===== Albums Table =====
CREATE TABLE albums (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    cover_image TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===== Album Images Table =====
CREATE TABLE album_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    album_id UUID NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_album_images_album_id ON album_images(album_id);
CREATE INDEX idx_album_images_sort_order ON album_images(album_id, sort_order);

-- ===== Admins Table =====
CREATE TABLE admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===== Page Content Table =====
CREATE TABLE page_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    label TEXT,
    value TEXT,
    type TEXT DEFAULT 'text' CHECK (type IN ('text', 'textarea', 'image')),
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_page_content_key ON page_content(key);
CREATE INDEX idx_page_content_sort ON page_content(sort_order);

-- ===== Row Level Security (RLS) =====

-- Enable RLS on all tables
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE album_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;

-- Posts: Public can read published posts with publish_at <= now()
CREATE POLICY "Public can read published posts"
    ON posts FOR SELECT
    USING (
        status = 'published'
        AND (publish_at IS NULL OR publish_at <= NOW())
    );

-- Posts: Admins can read all posts (including drafts)
CREATE POLICY "Admins can read all posts"
    ON posts FOR SELECT
    USING (is_admin());

-- Posts: Admins can insert
CREATE POLICY "Admins can insert posts"
    ON posts FOR INSERT
    WITH CHECK (is_admin());

-- Posts: Admins can update
CREATE POLICY "Admins can update posts"
    ON posts FOR UPDATE
    USING (is_admin());

-- Posts: Admins can delete
CREATE POLICY "Admins can delete posts"
    ON posts FOR DELETE
    USING (is_admin());

-- Albums: Public can read all albums
CREATE POLICY "Public can read albums"
    ON albums FOR SELECT
    USING (true);

-- Albums: Admins can manage
CREATE POLICY "Admins can manage albums"
    ON albums FOR ALL
    USING (is_admin());

-- Album Images: Public can read
CREATE POLICY "Public can read album images"
    ON album_images FOR SELECT
    USING (true);

-- Album Images: Admins can manage
CREATE POLICY "Admins can manage album images"
    ON album_images FOR ALL
    USING (is_admin());

-- Admins: Only admins can read
CREATE POLICY "Admins can read admins"
    ON admins FOR SELECT
    USING (is_admin());

-- Admins: Only admins can insert
CREATE POLICY "Admins can insert admins"
    ON admins FOR INSERT
    WITH CHECK (is_admin());

-- Page Content: Public can read
CREATE POLICY "Public can read page content"
    ON page_content FOR SELECT
    USING (true);

-- Page Content: Admins can manage
CREATE POLICY "Admins can manage page content"
    ON page_content FOR ALL
    USING (is_admin());

-- ===== Storage Bucket =====
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage: Public can read
CREATE POLICY "Public can read post images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'post-images');

-- Storage: Admins can upload
CREATE POLICY "Admins can upload post images"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'post-images'
        AND is_admin()
    );

-- Storage: Admins can update
CREATE POLICY "Admins can update post images"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'post-images'
        AND is_admin()
    );

-- Storage: Admins can delete
CREATE POLICY "Admins can delete post images"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'post-images'
        AND is_admin()
    );

-- ===== Triggers for updated_at =====
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_albums_updated_at
    BEFORE UPDATE ON albums
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_page_content_updated_at
    BEFORE UPDATE ON page_content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===== Sample Admins (UPDATE THESE EMAILS) =====
-- Add your admin emails here:
-- INSERT INTO admins (email, name) VALUES ('your-email@example.com', 'Admin Name');