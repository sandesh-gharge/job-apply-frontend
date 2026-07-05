create table user_details (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  first_name text,
  last_name text,
  location text,
  agent_api_key text,
  agent_api_url text,
  created_at timestamp default now(),
  profile_image_url text,
  signature_image_url text,
  role text not null
);

create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_details (id, email)
  values (new.id, new.email);

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table user_details enable row level security;

create policy "Users can view own profile"
on user_details
for select
using (auth.uid() = id);

create policy "Users can update own profile"
on user_details
for update
using (auth.uid() = id);
----
-- Users can upload files to their own folder
    CREATE POLICY "Users can upload their own assets"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'profile-assets'
      AND (storage.foldername(name))[1] = auth.uid()::text
    );

    -- Users can update/overwrite their own files (needed for upsert)
    CREATE POLICY "Users can update their own assets"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
      bucket_id = 'profile-assets'
      AND (storage.foldername(name))[1] = auth.uid()::text
    );

    -- Users can delete their own files
    CREATE POLICY "Users can delete their own assets"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'profile-assets'
      AND (storage.foldername(name))[1] = auth.uid()::text
    );

    -- Anyone can read (bucket is public, needed for public URLs)
    CREATE POLICY "Public read access for profile assets"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'profile-assets');
    ------------------------------------------------------------

    select * from user_details;