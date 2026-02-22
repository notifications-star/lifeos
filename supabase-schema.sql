-- ================================================
-- Run this SQL in your Supabase Dashboard:
-- SQL Editor → New Query → Paste & Run
-- ================================================

-- Drop old tables if they exist
DROP TABLE IF EXISTS chat_messages;
DROP TABLE IF EXISTS tasks;
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

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

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
  due_label TEXT,       -- e.g. "11:59 PM", "Tomorrow 8AM"
  source TEXT,          -- e.g. "Canvas", "Notion", "Manual"
  priority TEXT DEFAULT 'normal', -- overdue, today, upcoming
  tags TEXT[] DEFAULT '{}',

  sort_order INT DEFAULT 0
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own tasks"
  ON tasks FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

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

CREATE POLICY "Users can manage own messages"
  ON chat_messages FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Index for fast chat loading
CREATE INDEX idx_chat_messages_user ON chat_messages(user_id, created_at);
CREATE INDEX idx_tasks_user ON tasks(user_id, done, sort_order);
