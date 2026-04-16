const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

let supabase;

if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
  console.error('❌ Error: Invalid or missing SUPABASE_URL in .env file');
} else if (!supabaseKey) {
  console.error('❌ Error: Missing SUPABASE_ANON_KEY in .env file');
} else {
  supabase = createClient(supabaseUrl, supabaseKey);

  // Connection check
  (async () => {
    try {
      // Use a named table (even if it doesn't exist) to avoid "Invalid relation name" error
      const { error } = await supabase.from('connection_test').select('*').limit(0); 
      
      if (error && error.code === 'PGRST301') {
         // Table doesn't exist, but connection was successful
         console.log('✅ Supabase connected successfully');
      } else if (error && error.message.includes('fetch')) {
         console.error('❌ Supabase connection error: Could not reach Supabase (check your URL)');
      } else if (error) {
         // If it's another error but we got a response, the connection is likely working
         console.log('✅ Supabase reached (but returned error):', error.message);
      } else {
         console.log('✅ Supabase connected successfully');
      }
    } catch (err) {
      console.error('❌ Unexpected Supabase connection error:', err.message);
    }
  })();
}

module.exports = supabase;
