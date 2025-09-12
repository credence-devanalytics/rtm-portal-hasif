const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL);
const db = drizzle(sql);

async function checkTables() {
  try {
    const result = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%marketing%'
      ORDER BY table_name;
    `;
    console.log('Marketing tables:', result);
    
    // Also check what data exists in marketing_channel_byyear with different report_types
    const reportTypes = await sql`
      SELECT DISTINCT report_type 
      FROM marketing_channel_byyear 
      ORDER BY report_type;
    `;
    console.log('Available report types:', reportTypes);
    
    await sql.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkTables();
