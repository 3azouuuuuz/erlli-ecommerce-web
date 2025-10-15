import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://fhfjbtsvwdtvudpvsxyj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoZmpidHN2d2R0dnVkcHZzeHlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5ODQ2MjgsImV4cCI6MjA1NTU2MDYyOH0.jvx0zrUUSwCWA4jK6TOLVbIRjDMC5tzyhJhXaVHvTp8';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoZmpidHN2d2R0dnVkcHZzeHlqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczOTk4NDYyOCwiZXhwIjoyMDU1NTYwNjI4fQ.EEFAiz8dqdUvPgrW2qggEAVXs-5U7cO_bMzqHy56uUU';

// Initialize Supabase client for client-side operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Initialize Supabase client for server-side operations (use with caution, keep service key secure)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Note: If using Supabase Realtime, you may need to configure WebSocket for specific environments.
// For browser environments, the default WebSocket implementation is typically sufficient.
// TODO: Move sensitive credentials (supabaseServiceKey) to a .env file for security in production.