import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zxfgieikzahwycyzkkgn.supabase.co/rest/v1/';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4ZmdpZWlremFod3ljeXpra2duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxODUwODAsImV4cCI6MjEwMDc2MTA4MH0.B1r-I9rmSPs4DO2UM6RuljIZsUoCC1ekVlbc39ZSD0s';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);