const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL);

async function checkChannelGroupData() {
  try {
    console.log('Checking mentions_classify table structure with new channelgroup column...');
    
    // First check if the channelgroup column exists in the database
    const tableStructure = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'mentions_classify' 
      AND table_schema = 'public'
      ORDER BY ordinal_position;
    `;
    
    console.log('\nTable structure:', JSON.stringify(tableStructure, null, 2));
    
    // Now run your requested query to check the data
    const channelGroupData = await sql`
      SELECT groupname, channel, channelgroup, count(*) 
      FROM mentions_classify 
      GROUP BY groupname, channel, channelgroup 
      ORDER BY channelgroup;
    `;
    
    console.log('\nChannel group data sample:');
    console.log('Total unique combinations:', channelGroupData.length);
    
    // Show first 10 results
    console.log('\nFirst 10 results:');
    channelGroupData.slice(0, 10).forEach((row, index) => {
      console.log(`${index + 1}. Group: ${row.groupname}, Channel: ${row.channel}, Channel Group: ${row.channelgroup}, Count: ${row.count}`);
    });
    
    // Show radio stations specifically
    const radioData = channelGroupData.filter(row => 
      row.groupname && (row.groupname.toLowerCase().includes('radio') || 
      row.channel && row.channel.toLowerCase().includes('fm'))
    );
    
    console.log('\nRadio station data:');
    console.log('Total radio combinations:', radioData.length);
    radioData.forEach((row, index) => {
      console.log(`${index + 1}. Group: ${row.groupname}, Channel: ${row.channel}, Channel Group: ${row.channelgroup}, Count: ${row.count}`);
    });
    
    await sql.end();
  } catch (error) {
    console.error('Error:', error);
    await sql.end();
  }
}

checkChannelGroupData();