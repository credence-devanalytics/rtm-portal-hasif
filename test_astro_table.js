const { drizzle } = require('drizzle-orm/node-postgres');
const { Pool } = require('pg');

async function testAstroTable() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  });
  
  const db = drizzle(pool);
  
  try {
    console.log('Testing astro_rate_n_reach table...\n');
    
    // Test 1: Check if table exists and count records
    const countResult = await pool.query('SELECT COUNT(*) FROM astro_rate_n_reach');
    console.log(`✓ Table exists!`);
    console.log(`Total records: ${countResult.rows[0].count}\n`);
    
    if (parseInt(countResult.rows[0].count) === 0) {
      console.log('⚠️  Table is empty. You need to insert data first.\n');
      console.log('Sample INSERT statement:');
      console.log(`INSERT INTO astro_rate_n_reach (tx_date, tx_year, tx_month, channel, metric_type, value)
VALUES 
  ('2024-10-01', 2024, 10, 'TV1', 'rating', 51),
  ('2024-10-01', 2024, 10, 'TV1', 'reach', 5856),
  ('2024-10-01', 2024, 10, 'TV2', 'rating', 12),
  ('2024-10-01', 2024, 10, 'TV2', 'reach', 3456);
`);
      return;
    }
    
    // Test 2: Get sample records
    const sampleResult = await pool.query('SELECT * FROM astro_rate_n_reach LIMIT 5');
    console.log('Sample records:');
    console.table(sampleResult.rows);
    
    // Test 3: Get rating records
    const ratingResult = await pool.query("SELECT * FROM astro_rate_n_reach WHERE metric_type = 'rating' ORDER BY value DESC LIMIT 3");
    console.log('\nTop 3 Rating records:');
    console.table(ratingResult.rows);
    
    // Test 4: Get reach records
    const reachResult = await pool.query("SELECT * FROM astro_rate_n_reach WHERE metric_type = 'reach' ORDER BY value DESC LIMIT 3");
    console.log('\nTop 3 Reach records:');
    console.table(reachResult.rows);
    
    // Test 5: Get summary stats
    const statsResult = await pool.query(`
      SELECT 
        metric_type,
        COUNT(*) as count,
        SUM(value) as total,
        AVG(value) as average,
        MAX(value) as max_value,
        MIN(value) as min_value
      FROM astro_rate_n_reach
      GROUP BY metric_type
    `);
    console.log('\nSummary statistics by metric type:');
    console.table(statsResult.rows);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nFull error:', error);
  } finally {
    await pool.end();
  }
}

testAstroTable();
