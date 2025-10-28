import { NextResponse } from 'next/server';
import { db } from '@/index';
import { sql } from 'drizzle-orm';
import { marketingChannelByyear } from '../../../../drizzle/schema';

export async function GET() {
  try {
    console.log('Testing marketing table with sql template...');
    
    // Test 1: Using sql template with table reference
    const test1 = await db
      .select()
      .from(marketingChannelByyear)
      .where(sql`${marketingChannelByyear.year} = 2024`)
      .limit(5);
    
    console.log('✓ Test 1 (sql where) passed:', test1.length, 'records');
    
    // Test 2: Simple select without where
    const test2 = await db
      .select()
      .from(marketingChannelByyear)
      .limit(5);
    
    console.log('✓ Test 2 (simple select) passed:', test2.length, 'records');
    
    return NextResponse.json({
      success: true,
      test1: {
        count: test1.length,
        sample: test1[0]
      },
      test2: {
        count: test2.length,
        sample: test2[0]
      }
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack?.substring(0, 1000)
    }, { status: 500 });
  }
}
