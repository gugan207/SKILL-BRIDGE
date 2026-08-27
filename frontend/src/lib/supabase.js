import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mltkmkrrmpvgyhwdkpgl.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sdGtta3JybXB2Z3lod2RrcGdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1ODU4OTEsImV4cCI6MjEwMzE2MTg5MX0.CVGNCVPs0tsGCFsABRD-ciMvmyrTYmPzENQ22oGgFoM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
