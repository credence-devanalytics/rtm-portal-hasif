import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Testing database connection...');
    
    // First, let's check if we can import the database modules
    let db, marketingChannelByYear;
    
    try {
      const dbModule = await import('../../../index');
      db = dbModule.db;
      console.log('✓ Database module imported successfully');
    } catch (importError) {
      console.error('✗ Failed to import database module:', importError);
      return NextResponse.json({
        success: false,
        error: 'Database module import failed',
        details: importError.message
      }, { status: 500 });
    }

    try {
      const schemaModule = await import('../../../../drizzle/schema');
      marketingChannelByYear = schemaModule.marketingChannelByYear;
      console.log('✓ Schema imported successfully');
    } catch (schemaError) {
      console.error('✗ Failed to import schema:', schemaError);
      return NextResponse.json({
        success: false,
        error: 'Schema import failed',
        details: schemaError.message
      }, { status: 500 });
    }

    // Test basic database connection
    try {
      console.log('Testing basic query...');
      const testQuery = await db.select().from(marketingChannelByYear).limit(1);
      console.log('✓ Basic database query successful');
      console.log('Sample data:', testQuery);
    } catch (queryError) {
      console.error('✗ Database query failed:', queryError);
      return NextResponse.json({
        success: false,
        error: 'Database query failed',
        details: queryError.message
      }, { status: 500 });
    }

    // Test specific table structure
    try {
      const { eq } = await import('drizzle-orm');
      const tableTest = await db.select().from(marketingChannelByYear).where(eq(marketingChannelByYear.report_type, 'Chart 1')).limit(5);
      console.log('✓ Table structure test successful');
      console.log('Chart 1 data sample:', tableTest);
      
      return NextResponse.json({
        success: true,
        message: 'Database connection successful',
        sampleData: tableTest,
        dataCount: tableTest.length
      });
      
    } catch (structureError) {
      console.error('✗ Table structure test failed:', structureError);
      return NextResponse.json({
        success: false,
        error: 'Table structure test failed',
        details: structureError.message
      }, { status: 500 });
    }

  } catch (error) {
    console.error('✗ Unexpected error:', error);
    return NextResponse.json({
      success: false,
      error: 'Unexpected error occurred',
      details: error.message
    }, { status: 500 });
  }
}
