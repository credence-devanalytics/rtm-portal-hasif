const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL);
const db = drizzle(sql);

async function checkTVMonths() {
  try {
    // Check what months exist for Chart 2 (TV data)
    const tvMonths = await sql`
      SELECT DISTINCT month, year,
      CASE month
        WHEN 'Januari' THEN 1
        WHEN 'Februari' THEN 2
        WHEN 'Mac' THEN 3
        WHEN 'April' THEN 4
        WHEN 'Mei' THEN 5
        WHEN 'Jun' THEN 6
        WHEN 'Julai' THEN 7
        WHEN 'Ogos' THEN 8
        WHEN 'September' THEN 9
        WHEN 'Oktober' THEN 10
        WHEN 'November' THEN 11
        WHEN 'Disember' THEN 12
      END as month_order
      FROM marketing_channel_bymonth 
      WHERE report_type = 'Chart 2'
      ORDER BY year, month_order;
    `;
    console.log('Available TV months:', tvMonths);
    
    // Check count of records by month
    const monthCount = await sql`
      SELECT month, year, COUNT(*) as count
      FROM marketing_channel_bymonth 
      WHERE report_type = 'Chart 2'
      GROUP BY month, year
      ORDER BY year, 
      CASE month
        WHEN 'Januari' THEN 1
        WHEN 'Februari' THEN 2
        WHEN 'Mac' THEN 3
        WHEN 'April' THEN 4
        WHEN 'Mei' THEN 5
        WHEN 'Jun' THEN 6
        WHEN 'Julai' THEN 7
        WHEN 'Ogos' THEN 8
        WHEN 'September' THEN 9
        WHEN 'Oktober' THEN 10
        WHEN 'November' THEN 11
        WHEN 'Disember' THEN 12
      END;
    `;
    console.log('Month count breakdown:', monthCount);
    
    await sql.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkTVMonths();