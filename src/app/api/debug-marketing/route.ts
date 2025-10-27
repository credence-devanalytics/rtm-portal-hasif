import { NextResponse } from 'next/server';

export async function GET() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    env: {
      hasDbUrl: !!process.env.DATABASE_URL,
      dbUrlLength: process.env.DATABASE_URL?.length || 0,
    },
    tests: []
  };

  // Test 1: Can we import db?
  try {
    const { db } = await import('@/index');
    diagnostics.tests.push({
      name: 'Import db from @/index',
      status: 'success',
      result: db ? 'db object exists' : 'db is null/undefined'
    });
  } catch (error) {
    diagnostics.tests.push({
      name: 'Import db from @/index',
      status: 'failed',
      error: error.message,
      stack: error.stack
    });
    return NextResponse.json(diagnostics, { status: 500 });
  }

  // Test 2: Can we import schema?
  try {
    const schema = await import('../../../../drizzle/schema');
    const hasMarketingByyear = 'marketingChannelByyear' in schema;
    const hasMarketingBymonth = 'marketingChannelBymonth' in schema;
    
    diagnostics.tests.push({
      name: 'Import drizzle schema',
      status: 'success',
      result: {
        hasMarketingChannelByyear: hasMarketingByyear,
        hasMarketingChannelBymonth: hasMarketingBymonth,
        exports: Object.keys(schema).filter(k => k.includes('marketing'))
      }
    });
  } catch (error) {
    diagnostics.tests.push({
      name: 'Import drizzle schema',
      status: 'failed',
      error: error.message,
      stack: error.stack
    });
    return NextResponse.json(diagnostics, { status: 500 });
  }

  // Test 3: Can we query the database?
  try {
    const { db } = await import('@/index');
    const { marketingChannelByyear } = await import('../../../../drizzle/schema');
    
    const result = await db.select().from(marketingChannelByyear).limit(1);
    
    diagnostics.tests.push({
      name: 'Database query test',
      status: 'success',
      result: {
        recordCount: result.length,
        sampleFields: result[0] ? Object.keys(result[0]) : []
      }
    });
  } catch (error) {
    diagnostics.tests.push({
      name: 'Database query test',
      status: 'failed',
      error: error.message,
      stack: error.stack?.substring(0, 500)
    });
    return NextResponse.json(diagnostics, { status: 500 });
  }

  return NextResponse.json({
    ...diagnostics,
    overallStatus: 'All tests passed'
  });
}
