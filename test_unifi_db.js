/**
 * Test script to verify Unifi Viewership database connection and data
 */

require('dotenv/config');
const { drizzle } = require('drizzle-orm/node-postgres');
const { Pool } = require('pg');

async function testUnifiDatabase() {
  console.log('=== Testing Unifi Viewership Database Connection ===\n');
  
  // Check environment variable
  console.log('1. Checking DATABASE_URL...');
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set in environment variables');
    return;
  }
  console.log('✅ DATABASE_URL is set:', process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@'));
  
  // Test PostgreSQL connection
  console.log('\n2. Testing PostgreSQL connection...');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  
  try {
    const client = await pool.connect();
    console.log('✅ Successfully connected to PostgreSQL');
    
    // Check if unifi_viewership table exists
    console.log('\n3. Checking if unifi_viewership table exists...');
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'unifi_viewership'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      console.log('✅ unifi_viewership table exists');
      
      // Count records
      console.log('\n4. Counting records in unifi_viewership...');
      const countResult = await client.query('SELECT COUNT(*) FROM unifi_viewership');
      console.log(`✅ Total records: ${countResult.rows[0].count}`);
      
      // Get sample data
      console.log('\n5. Fetching sample data...');
      const sampleResult = await client.query('SELECT * FROM unifi_viewership LIMIT 5');
      console.log('✅ Sample records:');
      console.table(sampleResult.rows);
      
      // Check for NULL values in critical fields
      console.log('\n6. Checking for data quality issues...');
      const nullCheck = await client.query(`
        SELECT 
          COUNT(*) FILTER (WHERE viewership_month_year IS NULL) as null_month_year,
          COUNT(*) FILTER (WHERE channel_name IS NULL) as null_channel,
          COUNT(*) FILTER (WHERE program_name IS NULL) as null_program,
          COUNT(*) FILTER (WHERE mau IS NULL) as null_mau
        FROM unifi_viewership
      `);
      console.log('NULL value counts:');
      console.table(nullCheck.rows);
      
      // Check distinct months
      console.log('\n7. Checking available months...');
      const monthsResult = await client.query(`
        SELECT DISTINCT viewership_month_year 
        FROM unifi_viewership 
        ORDER BY viewership_month_year DESC
        LIMIT 10
      `);
      console.log('Available months:');
      monthsResult.rows.forEach(row => console.log(`  - ${row.viewership_month_year}`));
      
      // Check distinct channels
      console.log('\n8. Checking available channels...');
      const channelsResult = await client.query(`
        SELECT DISTINCT channel_name 
        FROM unifi_viewership 
        ORDER BY channel_name
      `);
      console.log('Available channels:');
      channelsResult.rows.forEach(row => console.log(`  - ${row.channel_name}`));
      
    } else {
      console.error('❌ unifi_viewership table does not exist');
      console.log('\nAttempting to list all tables...');
      const tablesResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `);
      console.log('Available tables:');
      tablesResult.rows.forEach(row => console.log(`  - ${row.table_name}`));
    }
    
    client.release();
  } catch (error) {
    console.error('❌ Database error:', error.message);
    console.error('Error details:', {
      name: error.name,
      code: error.code,
      detail: error.detail
    });
  } finally {
    await pool.end();
  }
  
  console.log('\n=== Test Complete ===');
}

testUnifiDatabase();
