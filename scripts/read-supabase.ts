import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY environment variables');
  process.exit(1);
}

console.log('Connecting to Supabase:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function tryReadTable(tableName: string) {
  console.log(`\n--- Table: ${tableName} ---`);
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .limit(3);
  
  if (error) {
    console.log(`  Not found or error: ${error.message}`);
    return null;
  }
  
  if (data && data.length > 0) {
    console.log('  Columns:', Object.keys(data[0]).join(', '));
    console.log('  Sample data:');
    data.forEach((row, i) => {
      console.log(`    Row ${i + 1}:`, JSON.stringify(row, null, 2).substring(0, 500));
    });
  } else {
    console.log('  (table exists but is empty)');
    // Try to get column info
    const { data: emptyData, error: emptyError } = await supabase
      .from(tableName)
      .select('*')
      .limit(0);
  }
  return data;
}

// Common table names to try based on user's description
const tablesToTry = [
  // Collaborator/referral related
  'collaborators',
  'collaborator',
  'referrals',
  'referral',
  'invitations',
  'invitation',
  'affiliates',
  'affiliate',
  // User related
  'users',
  'user',
  'profiles',
  'profile',
  'accounts',
  'account',
  // Service/Product related
  'services',
  'service',
  'programs',
  'program',
  'products',
  'product',
  // Financial related
  'commissions',
  'commission',
  'payments',
  'payment',
  'transactions',
  'transaction',
  'fees',
  'fee',
  // Partner related
  'partners',
  'partner',
  'members',
  'member',
  // Customer related
  'customers',
  'customer',
  'clients',
  'client',
  'leads',
  'lead',
  'enquiries',
  'enquiry'
];

async function main() {
  console.log('\n=== Supabase Database Structure ===\n');
  console.log('Scanning for tables...\n');
  
  const foundTables: string[] = [];
  
  for (const table of tablesToTry) {
    const result = await tryReadTable(table);
    if (result !== null) {
      foundTables.push(table);
    }
  }
  
  console.log('\n\n=== Summary ===');
  console.log('Tables found:', foundTables.length > 0 ? foundTables.join(', ') : 'None from common names');
  
  if (foundTables.length === 0) {
    console.log('\nNo tables found with common names. Your tables may have different names.');
    console.log('Please share your table names so I can query them directly.');
  }
}

main().catch(console.error);
