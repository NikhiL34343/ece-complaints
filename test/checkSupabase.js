const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'loaded' : 'missing');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

(async () => {
  const { data, error } = await supabase.from('profiles').select('*').limit(1);
  if (error) console.error('Error:', error.message);
  else console.log('Connection works! Example data:', data);
})();

