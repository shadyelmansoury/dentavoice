-- =============================================
-- DentaVoice Database Setup
-- Run this ONCE in Supabase SQL Editor
-- =============================================

-- 1. Patient Notes table (stores all clinical notes)
CREATE TABLE patient_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  patient_name TEXT NOT NULL,
  patient_id TEXT,
  visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  raw_transcript TEXT,
  structured_notes JSONB,
  recommendations JSONB,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Audit Log table (PHIPA compliance - tracks all data access & changes)
CREATE TABLE audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Row Level Security (users can ONLY see their own data)
ALTER TABLE patient_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for patient_notes
CREATE POLICY "Users can view their own notes"
  ON patient_notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notes"
  ON patient_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes"
  ON patient_notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes"
  ON patient_notes FOR DELETE
  USING (auth.uid() = user_id);

-- 5. RLS Policies for audit_log
CREATE POLICY "Users can view their own audit logs"
  ON audit_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert audit logs"
  ON audit_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 6. Auto-update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON patient_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 7. Indexes for fast queries
CREATE INDEX idx_patient_notes_user_id ON patient_notes(user_id);
CREATE INDEX idx_patient_notes_visit_date ON patient_notes(visit_date DESC);
CREATE INDEX idx_patient_notes_patient_name ON patient_notes(patient_name);
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at DESC);
