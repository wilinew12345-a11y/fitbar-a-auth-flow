-- 1. Create the exercises table
create table public.exercises (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null default auth.uid(),
  name text not null,
  body_part text not null,
  weight numeric default 0,
  sets numeric default 0,
  reps numeric default 0,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable Row Level Security (RLS)
alter table public.exercises enable row level security;

-- 3. Create policies so users can only see/edit their own data
create policy "Users can view their own exercises" on public.exercises
  for select using (auth.uid() = user_id);

create policy "Users can insert their own exercises" on public.exercises
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own exercises" on public.exercises
  for update using (auth.uid() = user_id);

create policy "Users can delete their own exercises" on public.exercises
  for delete using (auth.uid() = user_id);

-- 4. Create Storage Bucket for Images
insert into storage.buckets (id, name, public) values ('exercise_images', 'exercise_images', true);

-- 5. Storage Policies (Allow authenticated users to upload/view)
create policy "Give users access to own folder 1bk022_0" on storage.objects
  for select to public using (bucket_id = 'exercise_images');

create policy "Give users access to own folder 1bk022_1" on storage.objects
  for insert to public with check (bucket_id = 'exercise_images');