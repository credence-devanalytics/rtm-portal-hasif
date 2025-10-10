const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL);
const db = drizzle(sql);

async function checkMytvViewershipData() {
  try {
    console.log('Checking mytv_viewership table...\n');
    
    // Check if table exists
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'mytv_viewership';
    `;
    
    if (tables.length === 0) {
      console.log('❌ mytv_viewership table does NOT exist!');
      await sql.end();
      return;
    }
    
    console.log('✅ mytv_viewership table exists\n');
    
    // Get total count
    const count = await sql`SELECT COUNT(*) as count FROM mytv_viewership`;
    console.log(`Total records: ${count[0].count}\n`);
    
    // Get available years
    const years = await sql`
      SELECT DISTINCT year 
      FROM mytv_viewership 
      WHERE year IS NOT NULL
      ORDER BY year DESC;
    `;
    console.log('Available years:', years.map(y => y.year));
    
    // Get available channels
    const channels = await sql`
      SELECT DISTINCT channel 
      FROM mytv_viewership 
      WHERE channel IS NOT NULL
      ORDER BY channel;
    `;
    console.log('Available channels:', channels.map(c => c.channel));
    
    // Get available regions
    const regions = await sql`
      SELECT DISTINCT region 
      FROM mytv_viewership 
      WHERE region IS NOT NULL
      ORDER BY region;
    `;
    console.log('Available regions:', regions.map(r => r.region));
    
    // Get available months
    const months = await sql`
      SELECT DISTINCT month 
      FROM mytv_viewership 
      WHERE month IS NOT NULL
      ORDER BY month;
    `;
    console.log('Available months:', months.map(m => m.month));
    
    // Get sample data
    console.log('\nSample records:');
    const sample = await sql`
      SELECT * FROM mytv_viewership 
      LIMIT 5;
    `;
    console.log(sample);
    
    // Get summary by year
    console.log('\nSummary by year:');
    const summary = await sql`
      SELECT 
        year,
        COUNT(*) as record_count,
        COUNT(DISTINCT channel) as channel_count,
        COUNT(DISTINCT region) as region_count,
        SUM(viewers) as total_viewers
      FROM mytv_viewership
      WHERE year IS NOT NULL
      GROUP BY year
      ORDER BY year DESC;
    `;
    console.log(summary);
    
    await sql.end();
  } catch (error) {
    console.error('Error:', error);
    await sql.end();
  }
}

checkMytvViewershipData();
