import { NextResponse } from 'next/server';
import { db } from '@/index';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    console.log('Testing direct SQL query...');
    
    // Test 1: Check if we can connect at all
    const connectionTest = await db.execute(sql`SELECT 1 as test`);
    console.log('✓ Basic connection works:', connectionTest);
    
    // Test 2: Check if table exists
    const tableCheck = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'marketing_channel_byyear'
      )
    `);
    console.log('✓ Table exists check:', tableCheck);
    
    // Test 3: Try to select from table with raw SQL
    const rawQuery = await db.execute(sql`
      SELECT * FROM marketing_channel_byyear LIMIT 1
    `);
    console.log('✓ Raw SQL query result:', rawQuery);
    
    // Test 4: Count records
    const countQuery = await db.execute(sql`
      SELECT COUNT(*) as total FROM marketing_channel_byyear
    `);
    console.log('✓ Record count:', countQuery);
    
    return NextResponse.json({
      success: true,
      tests: {
        connection: 'passed',
        tableExists: tableCheck.rows[0]?.exists || false,
        rawQueryRows: rawQuery.rows.length,
        totalRecords: countQuery.rows[0]?.total || 0,
        sampleData: rawQuery.rows[0] || null
      }
    });
  } catch (error) {
    console.error('Error in test:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      detail: error.detail,
      stack: error.stack?.substring(0, 500)
    }, { status: 500 });
  }
}
