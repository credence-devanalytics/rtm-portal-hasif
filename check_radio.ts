const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL);

async function checkRadioData() {
  try {
    const radioData = await sql`
      SELECT * 
      FROM marketing_channel_bymonth 
      WHERE report_type = 'Chart 4'
      LIMIT 10;
    `;
    console.log('Radio monthly data sample:', JSON.stringify(radioData, null, 2));
    await sql.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkRadioData();