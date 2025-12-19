import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const tables = [
  'collaborators',
  'collaborator_programs', 
  'program_commissions',
  'customer_referrals',
  'commission_transactions',
  'commission_payouts',
  'programs',
  'users'
];

async function verifyTables() {
  console.log('=== Verifying Supabase Tables ===\n');
  
  for (const table of tables) {
    const { data, error, count } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.log(`❌ ${table}: ${error.message}`);
    } else {
      console.log(`✅ ${table}: exists (${count || 0} rows)`);
      
      // Get sample structure
      const { data: sample } = await supabase.from(table).select('*').limit(1);
      if (sample && sample.length > 0) {
        console.log(`   Columns: ${Object.keys(sample[0]).join(', ')}`);
      }
    }
  }
}

verifyTables().catch(console.error);
