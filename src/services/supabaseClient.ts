import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Student, AttendanceRecord, FeeTransaction, InstituteSettings } from '../types';

let cachedClient: SupabaseClient | null = null;
let currentUrl: string = '';
let currentKey: string = '';

export const getSupabaseClient = (url?: string, key?: string): SupabaseClient | null => {
  const metaEnv = (import.meta as any)?.env || {};
  const finalUrl = url || metaEnv.VITE_SUPABASE_URL || '';
  const finalKey = key || metaEnv.VITE_SUPABASE_ANON_KEY || '';

  if (!finalUrl || !finalKey) {
    return null;
  }

  if (cachedClient && currentUrl === finalUrl && currentKey === finalKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(finalUrl, finalKey);
    currentUrl = finalUrl;
    currentKey = finalKey;
    return cachedClient;
  } catch (err) {
    console.error('Error initializing Supabase client:', err);
    return null;
  }
};

export const testSupabaseConnection = async (url: string, key: string): Promise<{ success: boolean; message: string }> => {
  try {
    if (!url || !key) {
      return { success: false, message: 'Supabase URL and Anon Key are required.' };
    }
    const client = createClient(url, key);
    // Attempt a light query
    const { error } = await client.from('students').select('id').limit(1);
    if (error && error.code !== 'PGRST116' && !error.message.includes('relation "students" does not exist')) {
      return { success: false, message: error.message };
    }
    return { 
      success: true, 
      message: error && error.message.includes('does not exist')
        ? 'Connected to Supabase! (Database tables need to be created using the SQL script below).'
        : 'Successfully connected and verified Supabase connection!'
    };
  } catch (err: any) {
    return { success: false, message: err.message || 'Connection failed' };
  }
};

// SQL Schema generator for users to copy into Supabase SQL Editor
export const SUPABASE_SQL_SCHEMA = `-- ==========================================
-- Coaching Institute Management System Schema
-- Execute in Supabase SQL Editor (1-Click Run)
-- ==========================================

-- 1. Students Table
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  roll_no TEXT UNIQUE,
  initials TEXT NOT NULL,
  class TEXT NOT NULL,
  subjects JSONB DEFAULT '[]'::jsonb,
  monthly_fee NUMERIC NOT NULL DEFAULT 0,
  pending_amount NUMERIC NOT NULL DEFAULT 0,
  days_late INT DEFAULT 0,
  fee_status TEXT DEFAULT 'pending',
  last_payment_date DATE,
  parent_name TEXT NOT NULL,
  parent_phone TEXT NOT NULL,
  parent_email TEXT,
  joining_date DATE DEFAULT CURRENT_DATE,
  avatar_color TEXT DEFAULT 'bg-blue-600 text-white',
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Daily Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
  id TEXT PRIMARY KEY,
  student_id TEXT REFERENCES students(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status CHAR(1) NOT NULL CHECK (status IN ('P', 'A', 'L')),
  class TEXT NOT NULL,
  subject TEXT,
  marked_at TEXT,
  marked_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, date)
);

-- 3. Fee Transactions Table
CREATE TABLE IF NOT EXISTS fee_transactions (
  id TEXT PRIMARY KEY,
  receipt_no TEXT UNIQUE NOT NULL,
  student_id TEXT REFERENCES students(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  student_class TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  date DATE NOT NULL,
  month TEXT NOT NULL,
  payment_mode TEXT NOT NULL,
  reference_no TEXT,
  notes TEXT,
  collected_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Institute Settings Table
CREATE TABLE IF NOT EXISTS institute_settings (
  id TEXT PRIMARY KEY DEFAULT 'primary',
  institute_name TEXT NOT NULL,
  tagline TEXT,
  teacher_name TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  upi_id TEXT,
  currency_symbol TEXT DEFAULT '₹',
  late_fee_grace_days INT DEFAULT 7,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE institute_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read/write for demo authenticated/anon key access
CREATE POLICY "Allow anon read/write on students" ON students FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read/write on attendance" ON attendance FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read/write on fee_transactions" ON fee_transactions FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read/write on institute_settings" ON institute_settings FOR ALL TO anon USING (true) WITH CHECK (true);
`;
