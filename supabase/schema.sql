-- USERS table
create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  wallet text not null unique,
  yubikey_cred_id text unique,
  email text,
  created_at timestamptz default now()
);

-- RECORDS table
create table if not exists records (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  file_path text not null, -- For Supabase Storage
  encrypted_meta jsonb,
  shared_with text[], -- List of provider wallet addresses
  created_at timestamptz default now()
);