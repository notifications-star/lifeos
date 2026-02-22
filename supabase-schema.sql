-- ================================================
-- Run this SQL in your Supabase Dashboard:
-- SQL Editor → New Query → Paste & Run
-- ================================================

-- Drop old tables if they exist (order matters for foreign keys)
DROP TABLE IF EXISTS chat_messages;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS daily_logs;
DROP TABLE IF EXISTS goals;
DROP TABLE IF EXISTS user_profiles;

-- ═══════════════════════════════════════════
-- USER PROFILES
-- ═══════════════════════════════════════════
CREATE TABLE user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  name TEXT,
  email TEXT,
  age_bracket TEXT,
  answers JSONB DEFAULT '{}',
  selected_goals TEXT[] DEFAULT '{}',
  onboarding_complete BOOLEAN NOT NULL DEFAULT false
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_own" ON user_profiles FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ═══════════════════════════════════════════
-- TASKS
-- ═══════════════════════════════════════════
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  name TEXT NOT NULL,
  done BOOLEAN NOT NULL DEFAULT false,
  due_date TIMESTAMPTZ,
  due_label TEXT,
  source TEXT DEFAULT 'Manual',
  priority TEXT DEFAULT 'today',
  tags TEXT[] DEFAULT '{}',
  sort_order INT DEFAULT 0
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tasks_own" ON tasks FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ═══════════════════════════════════════════
-- EVENTS (calendar events, unexpected events)
-- ═══════════════════════════════════════════
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  name TEXT NOT NULL,
  emoji TEXT DEFAULT '📌',
  event_date DATE DEFAULT CURRENT_DATE,
  start_time TEXT,          -- e.g. "7:00 PM"
  end_time TEXT,            -- e.g. "Late", "10:00 PM"
  location TEXT,
  notes TEXT,
  is_unexpected BOOLEAN DEFAULT false,
  done BOOLEAN DEFAULT false
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "events_own" ON events FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ═══════════════════════════════════════════
-- DAILY LOGS (health, stats, mood)
-- ═══════════════════════════════════════════
CREATE TABLE daily_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  log_date DATE DEFAULT CURRENT_DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  sleep_hours NUMERIC(3,1),
  steps INT,
  screen_time_min INT,
  water_glasses INT,
  mood TEXT,                -- great, good, okay, bad, terrible
  energy TEXT,              -- high, medium, low
  notes TEXT,
  UNIQUE(user_id, log_date)
);

ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "logs_own" ON daily_logs FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ═══════════════════════════════════════════
-- GOALS
-- ═══════════════════════════════════════════
CREATE TABLE goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  name TEXT NOT NULL,
  category TEXT,            -- health, academic, social, career, personal
  target TEXT,              -- e.g. "Gym 4x/week", "Sleep 7h+", "GPA 3.5"
  active BOOLEAN DEFAULT true
);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "goals_own" ON goals FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ═══════════════════════════════════════════
-- CHAT MESSAGES
-- ═══════════════════════════════════════════
CREATE TABLE chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "chat_own" ON chat_messages FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_tasks_user ON tasks(user_id, done, sort_order);
CREATE INDEX idx_events_user ON events(user_id, event_date);
CREATE INDEX idx_logs_user ON daily_logs(user_id, log_date);
CREATE INDEX idx_goals_user ON goals(user_id, active);
CREATE INDEX idx_chat_user ON chat_messages(user_id, created_at);

-- ═══════════════════════════════════════════
-- LOCATION LOGS
-- ═══════════════════════════════════════════
CREATE TABLE location_logs (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  logged_at     TIMESTAMPTZ DEFAULT now() NOT NULL,
  latitude      DOUBLE PRECISION NOT NULL,
  longitude     DOUBLE PRECISION NOT NULL,
  accuracy      REAL,
  place_name    TEXT,
  place_type    TEXT
);

ALTER TABLE location_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own logs"
  ON location_logs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own logs"
  ON location_logs FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own logs"
  ON location_logs FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
