-- Create a public Storage bucket for guide profile and gallery photos
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'guide-photos',
  'guide-photos',
  true,
  5242880, -- 5 MB per file
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

-- Allow anyone to read photos (public bucket)
create policy "Public read guide photos"
  on storage.objects for select
  using ( bucket_id = 'guide-photos' );

-- Allow authenticated users and anonymous users to upload their own photos
create policy "Anyone can upload guide photos"
  on storage.objects for insert
  with check ( bucket_id = 'guide-photos' );

-- Allow users to update/delete their own photos
create policy "Anyone can update guide photos"
  on storage.objects for update
  using ( bucket_id = 'guide-photos' );

create policy "Anyone can delete guide photos"
  on storage.objects for delete
  using ( bucket_id = 'guide-photos' );
