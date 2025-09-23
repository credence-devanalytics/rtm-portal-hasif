const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL);

async function checkRadioChannelData() {
  try {
    const radioChannelData = await sql`
      SELECT * 
      FROM marketing_channel_byyear 
      WHERE report_type = 'Table 4'
      ORDER BY groupby, year, value DESC;
    `;
    console.log('Radio channel data sample:', JSON.stringify(radioChannelData, null, 2));
    console.log('Total records:', radioChannelData.length);
    
    // Group by channels
    const channelGroups = {};
    radioChannelData.forEach(row => {
      const channel = row.groupby;
      if (!channelGroups[channel]) {
        channelGroups[channel] = [];
      }
      channelGroups[channel].push(row);
    });
    
    console.log('Available channels:', Object.keys(channelGroups));
    
    await sql.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkRadioChannelData();