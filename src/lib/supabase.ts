import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://eetwvyguibfsypbcpqam.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVldHd2eWd1aWJmc3lwYmNwcWFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3MDI3MDAsImV4cCI6MjA4OTI3ODcwMH0.cSJdwMbqKnNefMtcvPeR7aMitY32d8NIi-viWG8A9Yo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
