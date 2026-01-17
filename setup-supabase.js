const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('Create a .env file with:');
  console.error('SUPABASE_URL=https://your-project.supabase.co');
  console.error('SUPABASE_ANON_KEY=your-anon-key');
  console.error('SUPABASE_SERVICE_KEY=your-service-key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  console.log('🚀 Starting Supabase Database Setup\n');
  
  try {
    // Step 1: Create users table
    console.log('📊 Step 1: Creating users table...');
    await createTableIfNotExists('users', `
      CREATE TABLE users (
        id BIGSERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        role VARCHAR(20) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
      );
    `);
    
    // Step 2: Create other tables
    console.log('\n📊 Step 2: Creating other tables...');
    await createTableIfNotExists('expenses', `
      CREATE TABLE expenses (
        id BIGSERIAL PRIMARY KEY,
        month VARCHAR(20) NOT NULL,
        entry_no VARCHAR(10),
        member_name VARCHAR(100),
        expense_date VARCHAR(20),
        purpose VARCHAR(200),
        quantity VARCHAR(10),
        amount DECIMAL(10,2),
        source_of_fund VARCHAR(50),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
        created_by VARCHAR(50)
      );
    `);
    
    await createTableIfNotExists('penalties', `
      CREATE TABLE penalties (
        id BIGSERIAL PRIMARY KEY,
        month VARCHAR(20) NOT NULL,
        entry_no VARCHAR(10),
        member_name VARCHAR(100),
        penalty_date VARCHAR(20),
        penalty_type VARCHAR(50),
        amount DECIMAL(10,2),
        signature VARCHAR(50),
        secretary_remark TEXT,
        is_paid BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
      );
    `);
    
    await createTableIfNotExists('monthly_collections', `
      CREATE TABLE monthly_collections (
        id BIGSERIAL PRIMARY KEY,
        month VARCHAR(20) NOT NULL,
        entry_no VARCHAR(10),
        member_name VARCHAR(100),
        collection_date VARCHAR(20),
        collection_type VARCHAR(10),
        amount DECIMAL(10,2),
        signature VARCHAR(50),
        secretary_remark TEXT,
        is_paid BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
      );
    `);
    
    // Step 3: Create default users
    console.log('\n👥 Step 3: Creating default users...');
    await createDefaultUsers();
    
    console.log('\n✅ Setup completed successfully!');
    console.log('\n📝 Login Credentials:');
    console.log('   Admin: jayvee / ADMIN01');
    console.log('   Secretary: marjhon / SECMJ');
    console.log('   Treasurer: christian / TREASCL');
    console.log('   Vice President: princess / VPRESPL');
    console.log('   Guest: guest / GUEST123');
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.log('\n💡 Manual Setup Required:');
    console.log('   1. Go to Supabase SQL Editor');
    console.log('   2. Run the SQL commands from setup.sql');
    console.log('   3. Insert default users manually');
  }
}

async function createTableIfNotExists(tableName, createSQL) {
  try {
    // Check if table exists
    const { error } = await supabase
      .from(tableName)
      .select('id')
      .limit(1);
    
    if (error && error.code === '42P01') {
      console.log(`   Creating ${tableName} table...`);
      
      // Try to execute SQL via RPC
      const { error: sqlError } = await supabase.rpc('exec_sql', { 
        query: createSQL 
      }).catch(async () => {
        console.log(`   ⚠️ Could not create ${tableName} via RPC`);
        console.log(`   📝 Run this SQL manually in Supabase:`);
        console.log(createSQL);
        return { error: { message: 'RPC failed' } };
      });
      
      if (!sqlError) {
        console.log(`   ✅ ${tableName} table created`);
      }
    } else {
      console.log(`   ✅ ${tableName} table exists`);
    }
  } catch (error) {
    console.log(`   ⚠️ Error with ${tableName}: ${error.message}`);
  }
}

async function createDefaultUsers() {
  const defaultUsers = [
    { username: 'jayvee', full_name: 'JAYVEE CARINGAL', role: 'admin', password: 'ADMIN01' },
    { username: 'marjhon', full_name: 'MAR JHON LUYAO', role: 'secretary', password: 'SECMJ' },
    { username: 'christian', full_name: 'CHRISTIAN LASPONIA', role: 'treasurer', password: 'TREASCL' },
    { username: 'princess', full_name: 'PRINCESS PADILLA', role: 'vicepresident', password: 'VPRESPL' },
    { username: 'guest', full_name: 'Guest User', role: 'guest', password: 'GUEST123' }
  ];
  
  let created = 0;
  let exists = 0;
  
  for (const user of defaultUsers) {
    try {
      // Check if user exists
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('username', user.username)
        .maybeSingle();
      
      if (existing) {
        console.log(`   ✓ ${user.username} already exists`);
        exists++;
      } else {
        // Insert user
        const { error } = await supabase
          .from('users')
          .insert([{
            username: user.username,
            full_name: user.full_name,
            role: user.role,
            password_hash: user.password,
            is_active: true
          }]);
        
        if (error) {
          console.log(`   ❌ Failed to create ${user.username}: ${error.message}`);
        } else {
          console.log(`   ✅ Created ${user.username} (${user.role})`);
          created++;
        }
      }
    } catch (error) {
      console.log(`   ⚠️ Error with ${user.username}: ${error.message}`);
    }
  }
  
  console.log(`\n   📊 Created: ${created}, Already exists: ${exists}`);
}

// Run setup
setupDatabase();
