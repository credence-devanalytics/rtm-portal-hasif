// Test script to check if pberita_audience_gender table exists
import { db } from './src/lib/db.js';
import { sql } from 'drizzle-orm';

async function testTable() {
  try {
    console.log('Testing pberita_audience_gender table...');
    
    // Try to query the table
    const result = await db.execute(sql`
      SELECT * FROM pberita_audience_gender LIMIT 5
    `);
    
    console.log('Table exists! Sample data:');
    console.log(result);
    
    // Check columns
    const columns = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'pberita_audience_gender'
      ORDER BY ordinal_position
    `);
    
    console.log('\nTable columns:');
    console.log(columns);
    
  } catch (error) {
    console.error('Error:', error.message);
    console.log('\nThe table might not exist yet. You need to create it first.');
  }
  
  process.exit(0);
}

testTable();
