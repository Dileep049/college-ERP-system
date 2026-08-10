-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 1. Profiles Table (Linked 1-to-1 with auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null unique,
  full_name text not null,
  role text not null check (role in ('admin', 'principal', 'hod', 'faculty', 'student', 'parent', 'librarian', 'placement', 'counsellor')),
  department text not null, -- 'CSE', 'BCA', etc. (or 'All', 'N/A' for admin/principal)
  semester text,            -- For students
  roll_number text,         -- For students
  mobile text,
  employee_id text,         -- For staff
  subjects text[],          -- For faculty
  counsellor_id uuid references public.profiles(id) on delete set null, -- For students
  counsellor_name text,
  created_at timestamp with time zone default now()
);

-- Enable RLS on Profiles
alter table public.profiles enable row level security;

-- Profiles Policies
create policy "Allow read access to all authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Allow update access to users for their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- 2. Leaves Table
create table public.leaves (
  id uuid default gen_random_uuid() primary key,
  applicant_id uuid references public.profiles(id) on delete cascade not null,
  applicant_name text not null,
  applicant_role text not null,
  department text not null,
  reason text not null,
  start_date date not null,
  end_date date not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  current_reviewer_role text check (current_reviewer_role in ('counsellor', 'hod', 'principal', 'admin')),
  counsellor_id uuid references public.profiles(id) on delete set null,
  counsellor_status text not null default 'pending' check (counsellor_status in ('pending', 'approved', 'rejected')),
  hod_status text not null default 'pending' check (hod_status in ('pending', 'approved', 'rejected')),
  principal_status text not null default 'pending' check (principal_status in ('pending', 'approved', 'rejected')),
  admin_status text not null default 'pending' check (admin_status in ('pending', 'approved', 'rejected')),
  remarks text,
  created_at timestamp with time zone default now()
);

-- Enable RLS on Leaves
alter table public.leaves enable row level security;

-- Leaves RLS Policies
create policy "Users can view their own leaves"
  on public.leaves for select
  to authenticated
  using (auth.uid() = applicant_id);

create policy "Counsellors can view & review student leaves of their department"
  on public.leaves for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'counsellor' and department = leaves.department
    )
  );

create policy "HODs can view & review faculty leaves of their department"
  on public.leaves for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'hod' and department = leaves.department
    )
  );

create policy "Principals can view & review HOD/Faculty leaves"
  on public.leaves for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'principal'
    )
  );

create policy "Admins can view & review Principal leaves"
  on public.leaves for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Applicants can insert their own leaves"
  on public.leaves for insert
  to authenticated
  with check (auth.uid() = applicant_id);

create policy "Reviewers can update leaves"
  on public.leaves for update
  to authenticated
  using (true);

-- 3. Notifications Table
create table public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  message text not null,
  type text not null check (type in ('success', 'info', 'warning', 'error')),
  is_read boolean not null default false,
  created_at timestamp with time zone default now()
);

-- Enable RLS on Notifications
alter table public.notifications enable row level security;

create policy "Users can view and update their own notifications"
  on public.notifications for all
  to authenticated
  using (auth.uid() = user_id);

-- 4. Auxiliary Tables for ERP Functions (with RLS enabled)
-- Attendance
create table public.attendance (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  student_name text not null,
  roll_number text not null,
  date date not null,
  status text not null check (status in ('present', 'absent')),
  branch text not null,
  semester text not null
);
alter table public.attendance enable row level security;
create policy "Attendance view policy" on public.attendance for select to authenticated using (auth.uid() = student_id or exists(select 1 from public.profiles where id = auth.uid() and role in ('faculty', 'hod', 'principal', 'admin', 'counsellor')));
create policy "Attendance write policy" on public.attendance for insert/update/delete to authenticated using (exists(select 1 from public.profiles where id = auth.uid() and role in ('faculty', 'hod', 'admin')));

-- Notes
create table public.notes (
  id uuid default gen_random_uuid() primary key,
  faculty_id uuid references public.profiles(id) on delete cascade not null,
  faculty_name text not null,
  branch text not null,
  semester text not null,
  subject text not null,
  topic text not null,
  description text,
  file_url text,
  file_name text,
  video_link text,
  created_at timestamp with time zone default now()
);
alter table public.notes enable row level security;
create policy "Notes view policy" on public.notes for select to authenticated using (true);
create policy "Notes write policy" on public.notes for all to authenticated using (auth.uid() = faculty_id or exists(select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Assignments
create table public.assignments (
  id uuid default gen_random_uuid() primary key,
  faculty_id uuid references public.profiles(id) on delete cascade not null,
  faculty_name text not null,
  branch text not null,
  semester text not null,
  subject text not null,
  topic text not null,
  description text not null,
  due_date date not null,
  created_at timestamp with time zone default now()
);
alter table public.assignments enable row level security;
create policy "Assignments view policy" on public.assignments for select to authenticated using (true);
create policy "Assignments write policy" on public.assignments for all to authenticated using (auth.uid() = faculty_id or exists(select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Results / Marks
create table public.results (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  roll_number text not null,
  semester text not null,
  gpa numeric,
  marks jsonb not null
);
alter table public.results enable row level security;
create policy "Results view policy" on public.results for select to authenticated using (auth.uid() = student_id or exists(select 1 from public.profiles where id = auth.uid() and role in ('faculty', 'hod', 'principal', 'admin', 'counsellor')));
create policy "Results write policy" on public.results for all to authenticated using (exists(select 1 from public.profiles where id = auth.uid() and role in ('faculty', 'hod', 'admin')));

-- Internal Marks
create table public.internal_marks (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  roll_number text not null,
  semester text not null,
  marks jsonb not null
);
alter table public.internal_marks enable row level security;
create policy "Internal marks view policy" on public.internal_marks for select to authenticated using (auth.uid() = student_id or exists(select 1 from public.profiles where id = auth.uid() and role in ('faculty', 'hod', 'principal', 'admin', 'counsellor')));
create policy "Internal marks write policy" on public.internal_marks for all to authenticated using (exists(select 1 from public.profiles where id = auth.uid() and role in ('faculty', 'hod', 'admin')));

-- Fees
create table public.fees (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  student_name text not null,
  roll_number text not null,
  department text not null,
  semester text not null,
  fee_type text not null,
  amount numeric not null,
  due_date date not null,
  status text not null default 'unpaid',
  paid_at timestamp with time zone,
  payment_method text
);
alter table public.fees enable row level security;
create policy "Fees view policy" on public.fees for select to authenticated using (auth.uid() = student_id or exists(select 1 from public.profiles where id = auth.uid() and role in ('admin', 'principal')));
create policy "Fees write policy" on public.fees for all to authenticated using (exists(select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Books & Circulations
create table public.books (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  author text not null,
  isbn text not null unique,
  category text not null,
  total_copies integer not null,
  available_copies integer not null
);
alter table public.books enable row level security;
create policy "Books view policy" on public.books for select to authenticated using (true);
create policy "Books write policy" on public.books for all to authenticated using (exists(select 1 from public.profiles where id = auth.uid() and role in ('librarian', 'admin')));

create table public.issued_books (
  id uuid default gen_random_uuid() primary key,
  book_id uuid references public.books(id) on delete cascade not null,
  book_title text not null,
  author text not null,
  student_id uuid references public.profiles(id) on delete cascade not null,
  student_name text not null,
  roll_number text not null,
  borrower_type text not null,
  issue_date date not null,
  due_date date not null,
  return_date date,
  status text not null default 'issued',
  fine numeric not null default 0
);
alter table public.issued_books enable row level security;
create policy "Issued books view policy" on public.issued_books for select to authenticated using (auth.uid() = student_id or exists(select 1 from public.profiles where id = auth.uid() and role in ('librarian', 'admin')));
create policy "Issued books write policy" on public.issued_books for all to authenticated using (exists(select 1 from public.profiles where id = auth.uid() and role in ('librarian', 'admin')));

-- Counselling Logs and Meetings
create table public.counselling_logs (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  student_name text not null,
  counsellor_id uuid references public.profiles(id) on delete cascade not null,
  counsellor_name text not null,
  date date not null default current_date,
  topic text not null,
  notes text not null,
  action_items text
);
alter table public.counselling_logs enable row level security;
create policy "Counselling logs view policy" on public.counselling_logs for select to authenticated using (auth.uid() = student_id or auth.uid() = counsellor_id or exists(select 1 from public.profiles where id = auth.uid() and role in ('hod', 'principal', 'admin')));
create policy "Counselling logs write policy" on public.counselling_logs for all to authenticated using (auth.uid() = counsellor_id or exists(select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create table public.counselling_meetings (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  student_name text not null,
  counsellor_id uuid references public.profiles(id) on delete cascade not null,
  counsellor_name text not null,
  title text not null,
  date date not null,
  time text not null,
  status text not null default 'pending'
);
alter table public.counselling_meetings enable row level security;
create policy "Counselling meetings view policy" on public.counselling_meetings for select to authenticated using (auth.uid() = student_id or auth.uid() = counsellor_id or exists(select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "Counselling meetings write policy" on public.counselling_meetings for all to authenticated using (auth.uid() = student_id or auth.uid() = counsellor_id or exists(select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Placement Drives
create table public.placement_drives (
  id uuid default gen_random_uuid() primary key,
  company_name text not null,
  role text not null,
  salary_package text not null,
  eligibility text not null,
  drive_date date not null,
  status text not null default 'upcoming',
  applicants uuid[] not null default '{}',
  selected_students uuid[] not null default '{}'
);
alter table public.placement_drives enable row level security;
create policy "Placement drives view policy" on public.placement_drives for select to authenticated using (true);
create policy "Placement drives write policy" on public.placement_drives for all to authenticated using (exists(select 1 from public.profiles where id = auth.uid() and role in ('placement', 'admin')));

-- Announcements
create table public.announcements (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  date date not null default current_date,
  author text not null
);
alter table public.announcements enable row level security;
create policy "Announcements view policy" on public.announcements for select to authenticated using (true);
create policy "Announcements write policy" on public.announcements for all to authenticated using (exists(select 1 from public.profiles where id = auth.uid() and role in ('admin', 'principal', 'hod', 'faculty')));

-- Timetables
create table public.timetables (
  id uuid default gen_random_uuid() primary key,
  branch text not null,
  semester text not null,
  day text not null,
  schedule jsonb not null
);
alter table public.timetables enable row level security;
create policy "Timetables view policy" on public.timetables for select to authenticated using (true);
create policy "Timetables write policy" on public.timetables for all to authenticated using (exists(select 1 from public.profiles where id = auth.uid() and role in ('admin', 'hod', 'faculty')));

-- Subject Allocations
create table public.subject_allocations (
  id uuid default gen_random_uuid() primary key,
  branch text not null,
  semester text not null,
  subject_name text not null,
  faculty_id uuid references public.profiles(id) on delete cascade not null,
  faculty_name text not null
);
alter table public.subject_allocations enable row level security;
create policy "Subject allocations view policy" on public.subject_allocations for select to authenticated using (true);
create policy "Subject allocations write policy" on public.subject_allocations for all to authenticated using (exists(select 1 from public.profiles where id = auth.uid() and role in ('admin', 'hod')));


-- Parent Meetings
create table public.parent_meetings (
  id uuid default gen_random_uuid() primary key,
  counsellor_id uuid references public.profiles(id) on delete cascade not null,
  student_id uuid references public.profiles(id) on delete cascade not null,
  student_name text not null,
  parent_name text not null,
  date date not null default current_date,
  notes text not null
);
alter table public.parent_meetings enable row level security;
create policy "Parent meetings view policy" on public.parent_meetings for select to authenticated using (auth.uid() = student_id or auth.uid() = counsellor_id or exists(select 1 from public.profiles where id = auth.uid() and role in ('admin', 'principal', 'hod')));
create policy "Parent meetings write policy" on public.parent_meetings for all to authenticated using (auth.uid() = counsellor_id or exists(select 1 from public.profiles where id = auth.uid() and role = 'admin'));


-- 5. ADMINISTRATIVE RPC FUNCTIONS (Security Definer)

-- Admin Create User
create or replace function public.create_user_admin(
  user_email text,
  user_password text,
  user_full_name text,
  user_role text,
  user_department text,
  user_semester text default null,
  user_roll_number text default null,
  user_mobile text default null,
  user_employee_id text default null,
  user_subjects text[] default null
) returns uuid
security definer
set search_path = public, auth
as $$
declare
  new_user_id uuid;
begin
  -- Validate caller is admin
  if not exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  ) then
    raise exception 'Access Denied: Only Super Admin can create accounts.';
  end if;

  -- Create Auth User
  insert into auth.users (instance_id, id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role)
  values (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    user_email,
    crypt(user_password, gen_salt('bf')),
    now(),
    jsonb_build_object('provider', 'email', 'providers', array['email']),
    jsonb_build_object('full_name', user_full_name),
    now(),
    now(),
    'authenticated'
  )
  returning id into new_user_id;

  -- Create Profile
  insert into public.profiles (id, email, full_name, role, department, semester, roll_number, mobile, employee_id, subjects)
  values (new_user_id, user_email, user_full_name, user_role, user_department, user_semester, user_roll_number, user_mobile, user_employee_id, user_subjects);

  -- If student, automatically associate Ward Counsellor
  if user_role = 'student' then
    update public.profiles p
    set counsellor_id = (select id from public.profiles where role = 'counsellor' and department = user_department limit 1),
        counsellor_name = (select full_name from public.profiles where role = 'counsellor' and department = user_department limit 1)
    where p.id = new_user_id;
  end if;

  return new_user_id;
end;
$$ language plpgsql;

-- Admin Edit User
create or replace function public.edit_user_admin(
  target_user_id uuid,
  user_full_name text,
  user_role text,
  user_department text,
  user_semester text,
  user_roll_number text,
  user_mobile text,
  user_employee_id text,
  user_subjects text[]
) returns void
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  ) then
    raise exception 'Access Denied: Only Super Admin can edit accounts.';
  end if;

  update public.profiles
  set full_name = user_full_name,
      role = user_role,
      department = user_department,
      semester = user_semester,
      roll_number = user_roll_number,
      mobile = user_mobile,
      employee_id = user_employee_id,
      subjects = user_subjects
  where id = target_user_id;
end;
$$ language plpgsql;

-- Admin Delete User
create or replace function public.delete_user_admin(target_user_id uuid)
returns void
security definer
set search_path = public, auth
as $$
begin
  if not exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  ) then
    raise exception 'Access Denied: Only Super Admin can delete accounts.';
  end if;

  delete from auth.users where id = target_user_id;
  delete from public.profiles where id = target_user_id;
end;
$$ language plpgsql;

-- Admin Reset Password
create or replace function public.reset_password_admin(target_user_id uuid, new_password text)
returns void
security definer
set search_path = public, auth
as $$
begin
  if not exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  ) then
    raise exception 'Access Denied: Only Super Admin can reset passwords.';
  end if;

  update auth.users
  set encrypted_password = crypt(new_password, gen_salt('bf')),
      updated_at = now()
  where id = target_user_id;
end;
$$ language plpgsql;


-- 6. TRIGGER-BASED NOTIFICATION SYSTEM

create or replace function public.on_leave_change()
returns trigger
security definer
set search_path = public
as $$
declare
  reviewer_id uuid;
begin
  -- 1. IF INSERTED (NEW LEAVE REQUESTED)
  if (TG_OP = 'INSERT') then
    
    -- Student Leave -> Department Ward Counsellor Notification
    if (new.applicant_role = 'student') then
      select id into reviewer_id from public.profiles 
      where role = 'counsellor' and department = new.department limit 1;
      
      if reviewer_id is not null then
        insert into public.notifications (user_id, message, type)
        values (reviewer_id, 'New student leave application submitted by ' || new.applicant_name, 'info');
      end if;

    -- Faculty Leave -> Department HOD Notification
    elsif (new.applicant_role = 'faculty') then
      select id into reviewer_id from public.profiles 
      where role = 'hod' and department = new.department limit 1;
      
      if reviewer_id is not null then
        insert into public.notifications (user_id, message, type)
        values (reviewer_id, 'New faculty leave application submitted by ' || new.applicant_name, 'info');
      end if;

    -- HOD Leave -> Principal Notification
    elsif (new.applicant_role = 'hod') then
      select id into reviewer_id from public.profiles 
      where role = 'principal' limit 1;
      
      if reviewer_id is not null then
        insert into public.notifications (user_id, message, type)
        values (reviewer_id, 'New HOD leave application submitted by ' || new.applicant_name, 'info');
      end if;

    -- Principal Leave -> Super Admin Notification
    elsif (new.applicant_role = 'principal') then
      for reviewer_id in select id from public.profiles where role = 'admin' loop
        insert into public.notifications (user_id, message, type)
        values (reviewer_id, 'New Principal leave application submitted by ' || new.applicant_name, 'info');
      end loop;
    end if;

  -- 2. IF UPDATED (STATE MOVES OR FINAL DECISION)
  elsif (TG_OP = 'UPDATE') then
    
    -- If status transitioned to approved or rejected, notify applicant
    if (old.status != new.status and new.status in ('approved', 'rejected')) then
      insert into public.notifications (user_id, message, type)
      values (
        new.applicant_id, 
        'Your leave application starting ' || new.start_date || ' has been ' || new.status, 
        case when new.status = 'approved' then 'success' else 'error'::text end
      );
    
    -- If Faculty Leave is approved by HOD, forward notification to Principal
    elsif (new.applicant_role = 'faculty' and old.hod_status = 'pending' and new.hod_status = 'approved') then
      select id into reviewer_id from public.profiles 
      where role = 'principal' limit 1;
      
      if reviewer_id is not null then
        insert into public.notifications (user_id, message, type)
        values (reviewer_id, 'Faculty leave approved by HOD: Forwarded for final Principal sign-off (' || new.applicant_name || ')', 'info');
      end if;
      
    -- If Faculty/HOD Leave is rejected by HOD/Principal, notify applicant
    elsif (old.status = 'pending' and new.status = 'rejected') then
      insert into public.notifications (user_id, message, type)
      values (new.applicant_id, 'Your leave application starting ' || new.start_date || ' has been rejected', 'error');
    end if;

  end if;
  return new;
end;
$$ language plpgsql;

create trigger tr_leave_change
after insert or update on public.leaves
for each row execute function public.on_leave_change();
