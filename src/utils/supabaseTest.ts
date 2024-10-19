import { supabase } from '../lib/supabaseClient';

async function testSupabaseConnection() {
  try {
    console.log("Testing Supabase connection...");
    const { data, error } = await supabase.from('users').select('count').single();
    
    if (error) {
      throw error;
    }
    
    console.log("Supabase connection successful. User count:", data.count);
  } catch (error) {
    console.error("Error connecting to Supabase:", error);
  }
}

testSupabaseConnection();