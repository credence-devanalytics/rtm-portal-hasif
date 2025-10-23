import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';

const db = drizzle(process.env.DATABASE_URL);

async function checkMarketingTable() {
  try {
    console.log('📊 Step 4: Checking marketing_channel_byyear table...\n');
    
    // Check if table exists
    const tableCheck = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'marketing_channel_byyear'
      ) as exists;
    `);
    console.log('✓ Table exists:', tableCheck.rows[0]?.exists);
    
    if (!tableCheck.rows[0]?.exists) {
      console.log('❌ ERROR: marketing_channel_byyear table does not exist!');
      process.exit(1);
    }
    
    // Check total records
    const totalCount = await db.execute(sql`
      SELECT COUNT(*) as count FROM marketing_channel_byyear;
    `);
    console.log('✓ Total records:', totalCount.rows[0]?.count);
    
    // Check distinct report_types
    const reportTypes = await db.execute(sql`
      SELECT DISTINCT report_type FROM marketing_channel_byyear ORDER BY report_type;
    `);
    console.log('✓ Distinct report_types:', reportTypes.rows.map(r => r.report_type).join(', '));
    
    // Check 2024 Chart 1 data
    const data2024 = await db.execute(sql`
      SELECT * FROM marketing_channel_byyear 
      WHERE year = 2024 AND report_type = 'Chart 1'
      LIMIT 5;
    `);
    console.log('\n✓ 2024 Chart 1 records found:', data2024.rows.length);
    if (data2024.rows.length > 0) {
      console.log('  Sample:', JSON.stringify(data2024.rows[0], null, 2));
    } else {
      console.log('  ⚠️ WARNING: No 2024 Chart 1 data found!');
    }
    
    // Check 2023 Chart 1 data
    const data2023 = await db.execute(sql`
      SELECT * FROM marketing_channel_byyear 
      WHERE year = 2023 AND report_type = 'Chart 1'
      LIMIT 5;
    `);
    console.log('\n✓ 2023 Chart 1 records found:', data2023.rows.length);
    if (data2023.rows.length > 0) {
      console.log('  Sample:', JSON.stringify(data2023.rows[0], null, 2));
    } else {
      console.log('  ⚠️ WARNING: No 2023 Chart 1 data found!');
    }
    
    // Check all years
    const years = await db.execute(sql`
      SELECT DISTINCT year FROM marketing_channel_byyear ORDER BY year;
    `);
    console.log('\n✓ Available years:', years.rows.map(r => r.year).join(', '));
    
    // Check saluran values
    const salurans = await db.execute(sql`
      SELECT DISTINCT saluran FROM marketing_channel_byyear 
      WHERE report_type = 'Chart 1'
      ORDER BY saluran;
    `);
    console.log('✓ Distinct salurans for Chart 1:', salurans.rows.map(r => r.saluran).join(', '));
    
    console.log('\n✅ Step 4 Complete: Table structure verified!\n');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Step 4 Failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

checkMarketingTable();
