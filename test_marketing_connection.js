const postgres = require('postgres').default;

const connectionString = "postgresql://root:%23M3dinaCredence%2125@202.165.14.216/rtmmedina";

async function testMarketingTable() {
  console.log('Testing Marketing table connection...\n');
  
  const sql = postgres(connectionString, { 
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
    debug: true
  });

  try {
    // Test basic connection
    console.log('1. Testing basic connection...');
    const result = await sql`SELECT NOW() as current_time`;
    console.log('✓ Connection successful:', result[0]);

    // Check if table exists
    console.log('\n2. Checking if marketing_channel_byyear table exists...');
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'marketing_channel_byyear'
      );
    `;
    console.log('✓ Table exists:', tableCheck[0].exists);

    // Check total records
    console.log('\n3. Checking total records...');
    const totalCount = await sql`SELECT COUNT(*) FROM marketing_channel_byyear`;
    console.log('✓ Total records:', totalCount[0].count);

    // Check 2024 Chart 1 data
    console.log('\n4. Checking 2024 Chart 1 data...');
    const data2024 = await sql`
      SELECT * FROM marketing_channel_byyear 
      WHERE year = 2024 AND report_type = 'Chart 1'
      LIMIT 5
    `;
    console.log('✓ 2024 Chart 1 records found:', data2024.length);
    if (data2024.length > 0) {
      console.log('Sample record:', data2024[0]);
    }

    // Check distinct years
    console.log('\n5. Checking available years...');
    const years = await sql`
      SELECT DISTINCT year FROM marketing_channel_byyear 
      WHERE report_type = 'Chart 1'
      ORDER BY year
    `;
    console.log('✓ Available years:', years.map(r => r.year));

    // Check distinct salurans
    console.log('\n6. Checking distinct salurans for Chart 1...');
    const salurans = await sql`
      SELECT DISTINCT saluran FROM marketing_channel_byyear 
      WHERE report_type = 'Chart 1'
    `;
    console.log('✓ Distinct salurans:', salurans.map(r => r.saluran));

    await sql.end();
    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Full error:', error);
    await sql.end();
  }
}

testMarketingTable();
