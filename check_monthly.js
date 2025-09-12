const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL);
const db = drizzle(sql);

async function checkMonthlyTable() {
  try {
    // Check what data exists in marketing_channel_bymonth with different report_types
    const reportTypes = await sql`
      SELECT DISTINCT report_type 
      FROM marketing_channel_bymonth 
      ORDER BY report_type;
    `;
    console.log('Available report types in monthly table:', reportTypes);
    
    // Check sample data
    const sampleData = await sql`
      SELECT * 
      FROM marketing_channel_bymonth 
      LIMIT 5;
    `;
    console.log('Sample monthly data:', sampleData);
    
    await sql.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkMonthlyTable();
