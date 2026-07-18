-- Dayynime Store Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor to set up tables and RLS policies.

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Create 'apps' table
create table public.apps (
    id uuid primary key default gen_random_uuid(),
    slug text unique not null,
    name text not null,
    description text,
    icon_url text,
    category text,
    is_published boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create 'releases' table
create table public.releases (
    id uuid primary key default gen_random_uuid(),
    app_id uuid not null references public.apps(id) on delete cascade,
    version text not null,
    changelog text,
    download_url text not null,
    file_size_mb numeric,
    is_latest boolean default false,
    published_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create 'admins' table
create table public.admins (
    id uuid primary key references auth.users(id) on delete cascade,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) on all tables
alter table public.apps enable row level security;
alter table public.releases enable row level security;
alter table public.admins enable row level security;

-- 4. Set up RLS Policies for 'apps'
-- Public can read published apps
create policy "Allow public read-only access for published apps" 
    on public.apps for select 
    using (is_published = true);

-- Admins can do all operations (INSERT, UPDATE, DELETE, SELECT all)
create policy "Allow full access for authenticated admins" 
    on public.apps for all 
    using (
        auth.role() = 'authenticated' and 
        exists (
            select 1 from public.admins 
            where admins.id = auth.uid()
        )
    );

-- 5. Set up RLS Policies for 'releases'
-- Public can read releases of published apps
create policy "Allow public read access for releases of published apps" 
    on public.releases for select 
    using (
        exists (
            select 1 from public.apps 
            where apps.id = releases.app_id and apps.is_published = true
        )
    );

-- Admins can do all operations on releases
create policy "Allow admins full access for releases" 
    on public.releases for all 
    using (
        auth.role() = 'authenticated' and 
        exists (
            select 1 from public.admins 
            where admins.id = auth.uid()
        )
    );

-- 6. Set up RLS Policies for 'admins'
-- Users can read their own admin record, or system service role can read all
create policy "Allow admins to read their own record" 
    on public.admins for select 
    using (auth.uid() = id);

-- Create a helper function to set or toggle 'is_latest' on other releases
-- When an admin marks a release as 'is_latest = true', we want to automatically unset 'is_latest'
-- on all other releases of the same 'app_id'.
create or replace function public.handle_latest_release_toggle()
returns trigger as $$
begin
    if NEW.is_latest = true then
        update public.releases
        set is_latest = false
        where app_id = NEW.app_id and id <> NEW.id;
    end if;
    return NEW;
end;
$$ language plpgsql security definer;

-- Create the trigger
create trigger set_latest_release_trigger
    before insert or update of is_latest on public.releases
    for each row
    execute function public.handle_latest_release_toggle();
