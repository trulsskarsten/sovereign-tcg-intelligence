import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://omxqbognenqzeeiazjzy.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9teHFib2duZW5xemVlaWF6anp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4MzY5NTAsImV4cCI6MjA5MTQxMjk1MH0.ZLimlB15XcsD5rF1RFs4JavHb5ublRSeUSlscE4_NWU";

const supabase = createClient(supabaseUrl, supabaseKey);

async function listTables() {
  try {
    const { data, error } = await supabase.rpc('get_tables'); // This might not exist
    if (error) {
       // Fallback: try to select from a common table
       console.log("Error listing tables via RPC, project might be uninitialized.");
    } else {
      console.log("Tables:", data);
    }
  } catch (err) {
    console.error("Failed:", err.message);
  }
}

listTables();
