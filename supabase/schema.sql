
-- Drop tables if they exist (will wipe data!)
drop table if exists medical_records cascade;
drop table if exists relationships cascade;
drop table if exists users cascade;

-- Create users table with TEXT ID
create table users (
  id text primary key,
  name text,
  role text check (role in ('patient', 'provider')) not null
);

-- Create relationships table using TEXT IDs
create table relationships (
  id serial primary key,
  patient_id text references users(id),
  provider_id text references users(id)
);

-- Create medical_records table using TEXT IDs
create table medical_records (
  id serial primary key,
  cid text not null,
  file_url text not null,
  uploaded_at timestamp default current_timestamp,
  patient_id text references users(id)
);
