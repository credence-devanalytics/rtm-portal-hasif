const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL);
const db = drizzle(sql);

async function checkTable2Data() {
  try {
    // Check what data exists for Table 2
    const table2Data = await sql`
      SELECT *
      FROM marketing_channel_byyear
      WHERE report_type = 'Table 2'
      ORDER BY year, saluran;
    `;
    console.log('Table 2 data:', table2Data);
    
    await sql.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkTable2Data();
