const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL);
const db = drizzle(sql);

async function testTVAPI() {
  try {
    console.log('Testing TV Monthly API logic...');
    
    const monthlyData = await sql`
      SELECT * 
      FROM marketing_channel_bymonth 
      WHERE report_type = 'Chart 2';
    `;

    console.log('TV data count:', monthlyData.length);
    console.log('Sample TV data:', monthlyData.slice(0, 3));

    // Process the data by month and year (using fixed logic)
    const processedData = {};
    
    // Month order mapping for proper sorting
    const monthOrder = {
      'Januari': 1, 'Februari': 2, 'Mac': 3, 'April': 4, 'Mei': 5, 'Jun': 6,
      'Julai': 7, 'Ogos': 8, 'September': 9, 'Oktober': 10, 'November': 11, 'Disember': 12
    };

    // Helper function to get month name
    function getMonthName(monthNumber) {
      const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      return months[monthNumber - 1] || monthNumber.toString();
    }

    // Group data by month and year
    monthlyData.forEach(item => {
      const year = item.year;
      const month = item.month;
      const value = parseFloat(item.value) || 0;
      
      if (!processedData[month]) {
        processedData[month] = {
          month: month,
          monthName: getMonthName(monthOrder[month] || 1),
          monthOrder: monthOrder[month] || 999,
          '2022': 0,
          '2023': 0,
          '2024': 0
        };
      }
      
      processedData[month][year.toString()] = value;
    });

    // Convert to array and sort by month order
    const chartData = Object.values(processedData)
      .sort((a, b) => a.monthOrder - b.monthOrder)
      .map(item => {
        const { monthOrder, ...rest } = item;
        return rest;
      });

    console.log('TV processed chart data:', chartData);

    await sql.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

testTVAPI();