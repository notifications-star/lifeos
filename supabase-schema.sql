-- ================================================
-- Run this SQL in your Supabase Dashboard:
-- SQL Editor → New Query → Paste & Run
-- ================================================
-- If you already created the old table, drop it first:
DROP TABLE IF EXISTS user_profiles;

CREATE TABLE user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  -- Profile
  name TEXT,
  email TEXT,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  wake_time TIME NOT NULL DEFAULT '07:00',
  sleep_time TIME NOT NULL DEFAULT '23:00',

  -- Goals
  goals TEXT[] NOT NULL DEFAULT '{}',
  distraction TEXT,

  -- Work style
  work_style_micro BOOLEAN NOT NULL DEFAULT false,
  work_style_deep BOOLEAN NOT NULL DEFAULT false,

  -- Quiet hours
  quiet_hours_enabled BOOLEAN NOT NULL DEFAULT true,
  quiet_hours_start TIME NOT NULL DEFAULT '23:00',
  quiet_hours_end TIME NOT NULL DEFAULT '07:00',

  -- Preferences
  intensity TEXT NOT NULL DEFAULT 'normal' CHECK (intensity IN ('gentle', 'normal', 'strict')),

  -- Permissions
  permission_location BOOLEAN NOT NULL DEFAULT false,
  permission_motion BOOLEAN NOT NULL DEFAULT false,

  -- Onboarding status
  onboarding_complete BOOLEAN NOT NULL DEFAULT false
);

-- Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
