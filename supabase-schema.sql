-- ================================================
-- Run this SQL in your Supabase Dashboard:
-- SQL Editor → New Query → Paste & Run
-- ================================================
-- Drop old table if exists
DROP TABLE IF EXISTS user_profiles;

CREATE TABLE user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  -- Profile
  name TEXT,
  email TEXT,
  age_bracket TEXT,

  -- Adaptive answers (JSONB for flexibility)
  answers JSONB DEFAULT '{}',

  -- Selected goals
  selected_goals TEXT[] DEFAULT '{}',

  -- Status
  onboarding_complete BOOLEAN NOT NULL DEFAULT false
);

-- Row Level Security
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
