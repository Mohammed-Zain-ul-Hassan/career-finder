-- Enable UUID extension
create extension if not exists "uuid-ossp";
-- Enable moddatetime extension for automatic updated_at handling
create extension if not exists "moddatetime";

-- Create ENUM types
create type public.job_match_status as enum ('new', 'applied', 'interviewing', 'rejected', 'offer');
create type public.interview_status as enum ('scheduled', 'completed', 'cancelled');

-- Profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Resumes table
create table public.resumes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  file_path text not null,
  original_name text not null,
  structured_data jsonb, -- Extracted skills, experience, etc.
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Jobs table (Scraped jobs)
create table public.jobs (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  company text not null,
  location text,
  description text,
  url text not null,
  source text, -- e.g., 'google_jobs', 'linkedin'
  salary_range text,
  posted_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(url) -- Prevent duplicate jobs
);

-- Job Searches table (History)
create table public.job_searches (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  roles text[] not null,
  locations text[] not null,
  keywords text[] not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Job Matches table (Links users to jobs with relevance)
create table public.job_matches (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  job_id uuid references public.jobs(id) on delete cascade not null,
  search_id uuid references public.job_searches(id) on delete set null, -- Link to specific search
  relevance_score float, -- 0 to 100
  match_reason text, -- AI explanation
  status public.job_match_status default 'new'::public.job_match_status,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, job_id) -- Keep unique constraint per user/job, regardless of search
);

-- Job Searches policies
alter table public.job_searches enable row level security;
create policy "Users can view own searches" on public.job_searches for select using (auth.uid() = user_id);
create policy "Users can insert own searches" on public.job_searches for insert with check (auth.uid() = user_id);
create policy "Users can delete own searches" on public.job_searches for delete using (auth.uid() = user_id);

-- Interviews table
create table public.interviews (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  job_match_id uuid references public.job_matches(id) on delete set null, -- Optional link to a matched job
  title text not null, -- e.g., "Frontend Engineer at Google"
  company text,
  date timestamp with time zone,
  status public.interview_status default 'scheduled'::public.interview_status,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Prep Materials table (AI generated content)
create table public.prep_materials (
  id uuid default uuid_generate_v4() primary key,
  interview_id uuid references public.interviews(id) on delete cascade not null,
  type text not null, -- 'questions', 'guide', 'tips'
  content jsonb not null, -- Structured Q&A or markdown
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table public.profiles enable row level security;
alter table public.resumes enable row level security;
alter table public.jobs enable row level security;
alter table public.job_matches enable row level security;
alter table public.interviews enable row level security;
alter table public.prep_materials enable row level security;

-- Profiles policies
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Resumes policies
create policy "Users can view own resumes" on public.resumes for select using (auth.uid() = user_id);
create policy "Users can insert own resumes" on public.resumes for insert with check (auth.uid() = user_id);
create policy "Users can delete own resumes" on public.resumes for delete using (auth.uid() = user_id);

-- Jobs policies
create policy "Jobs are viewable by everyone" on public.jobs for select using (true);
create policy "Service role can manage jobs" on public.jobs for all using (auth.role() = 'service_role');

-- Job Matches policies
create policy "Users can view own matches" on public.job_matches for select using (auth.uid() = user_id);
create policy "Users can manage own matches" on public.job_matches for all using (auth.uid() = user_id);

-- Interviews policies
create policy "Users can view own interviews" on public.interviews for select using (auth.uid() = user_id);
create policy "Users can manage own interviews" on public.interviews for all using (auth.uid() = user_id);

-- Prep Materials policies
create policy "Users can view own prep materials" on public.prep_materials for select using (
  exists (
    select 1 from public.interviews
    where id = prep_materials.interview_id
    and user_id = auth.uid()
  )
);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Triggers for updated_at
create trigger handle_updated_at before update on public.profiles
  for each row execute procedure moddatetime (updated_at);

create trigger handle_updated_at before update on public.resumes
  for each row execute procedure moddatetime (updated_at);
