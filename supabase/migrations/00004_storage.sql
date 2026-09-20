-- ============================================================
-- DIGITAL HEROES — STORAGE BUCKETS & SECURITY POLICIES
-- Migration: 00004_storage.sql
-- ============================================================

-- 1. Create Buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('winner-proofs', 'winner-proofs', false, 10485760, ARRAY['image/jpeg', 'image/png', 'application/pdf']),
    ('charity-media', 'charity-media', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'])
ON CONFLICT (id) DO NOTHING;

-- 2. Winner Proofs Policies
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated users can upload winner proofs'
    ) THEN
        CREATE POLICY "Authenticated users can upload winner proofs"
        ON storage.objects FOR INSERT TO authenticated
        WITH CHECK (bucket_id = 'winner-proofs');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users and admins can view winner proofs'
    ) THEN
        CREATE POLICY "Users and admins can view winner proofs"
        ON storage.objects FOR SELECT TO authenticated
        USING (
            bucket_id = 'winner-proofs'
            AND (
                (storage.foldername(name))[1] = auth.uid()::text 
                OR EXISTS (
                    SELECT 1 FROM public.profiles 
                    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
                )
            )
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public charity media access'
    ) THEN
        CREATE POLICY "Public charity media access"
        ON storage.objects FOR SELECT TO public
        USING (bucket_id = 'charity-media');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admins can manage charity media'
    ) THEN
        CREATE POLICY "Admins can manage charity media"
        ON storage.objects FOR ALL TO authenticated
        USING (
            bucket_id = 'charity-media'
            AND EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
            )
        );
    END IF;
END $$;
