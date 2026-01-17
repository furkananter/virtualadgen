-- =============================================
-- VisualAdGen Database Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- ENUMS
create type node_type as enum (
  'TEXT_INPUT', 
  'IMAGE_INPUT', 
  'SOCIAL_MEDIA', 
  'PROMPT', 
  'IMAGE_MODEL', 
  'OUTPUT'
);

create type execution_status as enum (
  'PENDING', 
  'RUNNING', 
  'PAUSED', 
  'COMPLETED', 
  'FAILED', 
  'CANCELLED'
);

create type node_execution_status as enum (
  'PENDING', 
  'RUNNING', 
  'PAUSED', 
  'COMPLETED', 
  'FAILED', 
  'SKIPPED'
);

-- TABLES
create table users (
  id uuid primary key default auth.uid(),
  email text unique not null,
  name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table workflows (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade not null,
  name text not null,
  description text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table nodes (
  id uuid primary key default gen_random_uuid(),
  workflow_id uuid references workflows(id) on delete cascade not null,
  type node_type not null,
  name text not null,
  config jsonb default '{}',
  position_x float default 0,
  position_y float default 0,
  has_breakpoint boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table edges (
  id uuid primary key default gen_random_uuid(),
  workflow_id uuid references workflows(id) on delete cascade not null,
  source_node_id uuid references nodes(id) on delete cascade not null,
  target_node_id uuid references nodes(id) on delete cascade not null,
  source_handle text,
  target_handle text,
  created_at timestamptz default now(),
  unique(source_node_id, target_node_id, source_handle, target_handle)
);

create table executions (
  id uuid primary key default gen_random_uuid(),
  workflow_id uuid references workflows(id) on delete cascade not null,
  status execution_status default 'PENDING',
  total_cost decimal(10,6),
  error_message text,
  started_at timestamptz default now(),
  finished_at timestamptz
);

create table node_executions (
  id uuid primary key default gen_random_uuid(),
  execution_id uuid references executions(id) on delete cascade not null,
  node_id uuid not null,  -- Note: No FK to nodes as nodes may be deleted/recreated on workflow save
  node_type text,         -- Preserved node type (survives node deletion)
  node_name text,         -- Preserved node name (survives node deletion)
  status node_execution_status default 'PENDING',
  input_data jsonb,
  output_data jsonb,
  error_message text,
  started_at timestamptz,
  finished_at timestamptz,
  unique(execution_id, node_id)
);

create table generations (
  id uuid primary key default gen_random_uuid(),
  execution_id uuid references executions(id) on delete cascade not null,
  model_id text not null,
  prompt text not null,
  parameters jsonb default '{}',
  image_urls text[] not null,
  aspect_ratio text not null,
  cost decimal(10,6),
  created_at timestamptz default now()
);

-- ROW LEVEL SECURITY
alter table users enable row level security;
alter table workflows enable row level security;
alter table nodes enable row level security;
alter table edges enable row level security;
alter table executions enable row level security;
alter table node_executions enable row level security;
alter table generations enable row level security;

-- POLICIES
create policy "Users can view own profile" on users
  for select using (auth.uid() = id);

create policy "Users can update own profile" on users
  for update using (auth.uid() = id);

create policy "Users can CRUD own workflows" on workflows
  for all using (auth.uid() = user_id);

create policy "Users can CRUD nodes of own workflows" on nodes
  for all using (
    workflow_id in (
      select id from workflows where user_id = auth.uid()
    )
  );

create policy "Users can CRUD edges of own workflows" on edges
  for all using (
    workflow_id in (
      select id from workflows where user_id = auth.uid()
    )
  );

create policy "Users can view own executions" on executions
  for select using (
    workflow_id in (
      select id from workflows where user_id = auth.uid()
    )
  );

create policy "Users can view own node executions" on node_executions
  for select using (
    execution_id in (
      select e.id from executions e
      join workflows w on e.workflow_id = w.id
      where w.user_id = auth.uid()
    )
  );

create policy "Users can view own generations" on generations
  for select using (
    execution_id in (
      select e.id from executions e
      join workflows w on e.workflow_id = w.id
      where w.user_id = auth.uid()
    )
  );

-- AUTH TRIGGERS
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, name, avatar_url, created_at, updated_at)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    now(),
    now()
  )
  on conflict (id) do update
    set email = excluded.email,
        name = excluded.name,
        avatar_url = excluded.avatar_url,
        updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- =============================================
-- STORAGE BUCKET & RLS POLICIES
-- =============================================
-- NOTE: Run this in Supabase Dashboard > Storage > Policies
-- Or use the Supabase Management API to create the bucket

-- Create bucket (run via Dashboard or API, not SQL):
-- Bucket name: image-inputs
-- Public: false
-- File size limit: 10MB
-- Allowed MIME types: image/*

-- Storage RLS Policies (run in SQL Editor):
-- Files are stored as: {user_id}/{filename}

-- Allow authenticated users to upload to their own folder
create policy "Users can upload to own folder"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'image-inputs' 
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to read their own files
create policy "Users can view own files"
on storage.objects for select
to authenticated
using (
  bucket_id = 'image-inputs' 
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own files
create policy "Users can update own files"
on storage.objects for update
to authenticated
using (
  bucket_id = 'image-inputs' 
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'image-inputs' 
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own files
create policy "Users can delete own files"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'image-inputs' 
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- =============================================
-- GENERATED IMAGES BUCKET RLS POLICIES
-- =============================================
-- Bucket name: generated-images
-- Public: false (private bucket with signed URLs)
-- File size limit: 20MB

-- Allow service role to upload (backend uploads via service key)
create policy "Service can upload generated images"
on storage.objects for insert
to service_role
with check (bucket_id = 'generated-images');

-- Allow authenticated users to view their own generated images
create policy "Users can view own generated images"
on storage.objects for select
to authenticated
using (
  bucket_id = 'generated-images' 
  and (storage.foldername(name))[1] = auth.uid()::text
);

