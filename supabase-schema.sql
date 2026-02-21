-- ================================================
-- Run this SQL in your Supabase Dashboard:
-- SQL Editor → New Query → Paste & Run
-- ================================================

CREATE TABLE user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  -- Profile
  name TEXT,
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
  permission_motion BOOLEAN NOT NULL DEFAULT false
);

-- Allow anonymous inserts (since we don't have auth yet)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous inserts"
  ON user_profiles
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous reads"
  ON user_profiles
  FOR SELECT
  TO anon
  USING (true);
