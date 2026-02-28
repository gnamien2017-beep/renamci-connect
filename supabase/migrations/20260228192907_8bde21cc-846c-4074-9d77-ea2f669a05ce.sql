
-- Create storage bucket for profile photos
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Allow anyone to upload to avatars bucket
CREATE POLICY "Anyone can upload avatars" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'avatars');

-- Allow public read access
CREATE POLICY "Public read access for avatars" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'avatars');
