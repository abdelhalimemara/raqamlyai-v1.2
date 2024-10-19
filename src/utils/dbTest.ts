import { supabase } from '../lib/supabaseClient';

export const testDatabaseConnection = async () => {
  console.log('Testing database connection...');
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .single();

    if (error) {
      console.error('Database connection test failed:', error);
      return false;
    }

    console.log('Database connection test successful. User count:', data.count);
    return true;
  } catch (error) {
    console.error('Error testing database connection:', error);
    return false;
  }
};