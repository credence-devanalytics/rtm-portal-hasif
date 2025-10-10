const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL);
const db = drizzle(sql);

async function checkMytvTables() {
  try {
    // Check if mytv tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%mytv%'
      ORDER BY table_name;
    `;
    console.log('MyTV tables:', tables);
    
    // Check mytv_analysis table
    if (tables.some(t => t.table_name === 'mytv_analysis')) {
      const analysisCount = await sql`SELECT COUNT(*) as count FROM mytv_analysis`;
      console.log('\nmytv_analysis record count:', analysisCount[0].count);
      
      const analysisSample = await sql`SELECT * FROM mytv_analysis LIMIT 5`;
      console.log('\nmytv_analysis sample data:', analysisSample);
      
      const analysisColumns = await sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'mytv_analysis'
        ORDER BY ordinal_position;
      `;
      console.log('\nmytv_analysis columns:', analysisColumns);
    }
    
    // Check mytv_viewership table
    if (tables.some(t => t.table_name === 'mytv_viewership')) {
      const viewershipCount = await sql`SELECT COUNT(*) as count FROM mytv_viewership`;
      console.log('\nmytv_viewership record count:', viewershipCount[0].count);
      
      const viewershipSample = await sql`SELECT * FROM mytv_viewership LIMIT 5`;
      console.log('\nmytv_viewership sample data:', viewershipSample);
    } else {
      console.log('\n⚠️ mytv_viewership table does NOT exist!');
      console.log('We need to either:');
      console.log('1. Create the table and populate it with data, OR');
      console.log('2. Use the mytv_analysis table instead');
    }
    
    await sql.end();
  } catch (error) {
    console.error('Error:', error);
    await sql.end();
  }
}

checkMytvTables();
