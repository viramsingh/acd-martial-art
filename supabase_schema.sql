-- =============================================================
-- ACD MARTIAL ARTS - OFFICIAL SUPABASE DATABASE SCHEMA
-- Instructions: Copy and run this entire SQL script inside
-- your Supabase Dashboard -> SQL Editor -> Run!
-- =============================================================

-- 1. STUDENTS TABLE
CREATE TABLE IF NOT EXISTS public.students (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    dob TEXT DEFAULT '',
    gender TEXT DEFAULT 'Male',
    phone TEXT DEFAULT '',
    email TEXT DEFAULT '',
    address TEXT DEFAULT '',
    guardian_name TEXT DEFAULT '',
    emergency_phone TEXT DEFAULT '',
    school_name TEXT DEFAULT '',
    batch TEXT DEFAULT 'Evening 5:00 To 6:00',
    belt_level TEXT DEFAULT 'White Belt',
    status TEXT DEFAULT 'ACTIVE',
    joining_date TEXT DEFAULT CURRENT_DATE::text,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. ATTENDANCE TABLE
CREATE TABLE IF NOT EXISTS public.attendance (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    student_id TEXT NOT NULL,
    student_name TEXT NOT NULL,
    batch TEXT DEFAULT '',
    status TEXT DEFAULT 'PRESENT',
    check_in_time TEXT DEFAULT '',
    remarks TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. ACHIEVEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.achievements (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    student_name TEXT NOT NULL,
    event TEXT DEFAULT '',
    position TEXT DEFAULT '',
    date TEXT DEFAULT '',
    description TEXT DEFAULT '',
    image_url TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'EVENT',
    date TEXT DEFAULT '',
    time TEXT DEFAULT '',
    location TEXT DEFAULT '',
    description TEXT DEFAULT '',
    badge_color TEXT DEFAULT 'gold',
    image TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.messages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    subject TEXT DEFAULT '',
    message TEXT DEFAULT '',
    status TEXT DEFAULT 'NEW',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. REGISTRATIONS TABLE
CREATE TABLE IF NOT EXISTS public.registrations (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    dob TEXT DEFAULT '',
    gender TEXT DEFAULT 'Male',
    phone TEXT DEFAULT '',
    email TEXT DEFAULT '',
    address TEXT DEFAULT '',
    guardian_name TEXT DEFAULT '',
    emergency_phone TEXT DEFAULT '',
    school_name TEXT DEFAULT '',
    batch TEXT DEFAULT 'Evening 5:00 To 6:00',
    belt_level TEXT DEFAULT 'White Belt',
    experience TEXT DEFAULT 'Beginner',
    status TEXT DEFAULT 'PENDING',
    submitted_at TEXT DEFAULT CURRENT_TIMESTAMP::text,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. SHEETS CONFIG TABLE
CREATE TABLE IF NOT EXISTS public.sheets_config (
    id TEXT PRIMARY KEY DEFAULT 'config_primary',
    web_app_url TEXT DEFAULT '',
    enabled BOOLEAN DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ENABLE RLS & ADD PERMISSIVE PUBLIC ACCESS POLICIES
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sheets_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public access students" ON public.students;
DROP POLICY IF EXISTS "Allow public access attendance" ON public.attendance;
DROP POLICY IF EXISTS "Allow public access achievements" ON public.achievements;
DROP POLICY IF EXISTS "Allow public access events" ON public.events;
DROP POLICY IF EXISTS "Allow public access messages" ON public.messages;
DROP POLICY IF EXISTS "Allow public access registrations" ON public.registrations;
DROP POLICY IF EXISTS "Allow public access sheets_config" ON public.sheets_config;

CREATE POLICY "Allow public access students" ON public.students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access attendance" ON public.attendance FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access achievements" ON public.achievements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access events" ON public.events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access messages" ON public.messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access registrations" ON public.registrations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access sheets_config" ON public.sheets_config FOR ALL USING (true) WITH CHECK (true);

-- 8. ADMIN CREDENTIALS TABLE (Dynamic Master Login)
CREATE TABLE IF NOT EXISTS public.admin_credentials (
    id TEXT PRIMARY KEY DEFAULT 'primary',
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.admin_credentials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public access admin_credentials" ON public.admin_credentials;
CREATE POLICY "Allow public access admin_credentials" ON public.admin_credentials FOR ALL USING (true) WITH CHECK (true);

