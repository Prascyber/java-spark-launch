-- Create enum for roles
create type public.app_role as enum ('admin', 'student');

-- Create user_roles table
create table public.user_roles (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    role app_role not null default 'student',
    created_at timestamp with time zone default now(),
    unique (user_id, role)
);

-- Enable RLS
alter table public.user_roles enable row level security;

-- Create security definer function to check roles
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- Create function to check if user is admin
create or replace function public.is_admin(_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = 'admin'
  )
$$;

-- RLS Policies for user_roles
create policy "Users can view their own roles"
on public.user_roles
for select
using (auth.uid() = user_id);

create policy "Admins can view all roles"
on public.user_roles
for select
using (public.is_admin(auth.uid()));

create policy "Admins can insert roles"
on public.user_roles
for insert
with check (public.is_admin(auth.uid()));

create policy "Admins can update roles"
on public.user_roles
for update
using (public.is_admin(auth.uid()));

create policy "Admins can delete roles"
on public.user_roles
for delete
using (public.is_admin(auth.uid()));

-- Update profiles table policies to allow admins to view all profiles
create policy "Admins can view all profiles"
on public.profiles
for select
using (public.is_admin(auth.uid()));

-- Update orders table policies to allow admins to view all orders
create policy "Admins can view all orders"
on public.orders
for select
using (public.is_admin(auth.uid()));

create policy "Admins can update orders"
on public.orders
for update
using (public.is_admin(auth.uid()));

-- Function to assign student role on signup
create or replace function public.assign_student_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_roles (user_id, role)
  values (new.id, 'student');
  return new;
end;
$$;

-- Trigger to assign student role on user creation
create trigger on_auth_user_created_assign_role
  after insert on auth.users
  for each row execute procedure public.assign_student_role();