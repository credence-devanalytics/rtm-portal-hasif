const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL);
const db = drizzle(sql);

async function testRadioAPI() {
  try {
    console.log('Testing Radio API logic...');
    
    const monthlyData = await sql`
      SELECT * 
      FROM marketing_channel_bymonth 
      WHERE report_type = 'Chart 4';
    `;

    console.log('Radio data count:', monthlyData.length);
    console.log('Sample radio data:', monthlyData.slice(0, 3));

    // Process the data by month and year
    const processedData = {};
    
    // Month order mapping
    const monthOrder = {
      'Januari': 1, 'Februari': 2, 'Mac': 3, 'April': 4, 'Mei': 5, 'Jun': 6,
      'Julai': 7, 'Ogos': 8, 'September': 9, 'Oktober': 10, 'November': 11, 'Disember': 12
    };

    // Group data by month and year
    monthlyData.forEach(row => {
      const month = row.month;
      const year = row.year;
      const value = parseFloat(row.value) || 0;

      if (!processedData[month]) {
        processedData[month] = {
          month,
          monthOrder: monthOrder[month] || 999
        };
      }
      
      processedData[month][year] = value;
    });

    // Convert to array and sort by month order
    const chartData = Object.values(processedData)
      .sort((a, b) => a.monthOrder - b.monthOrder)
      .map(item => {
        const { monthOrder, ...rest } = item;
        return rest;
      });

    console.log('Processed chart data:', chartData.slice(0, 3));
    console.log('Radio API test successful!');
    
    await sql.end();
  } catch (error) {
    console.error('Radio API test error:', error);
  }
}

testRadioAPI();