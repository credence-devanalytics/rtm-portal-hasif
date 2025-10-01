// Direct database test for channel groups functionality
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { sql, count, desc } = require('drizzle-orm');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Import the schema (we'll mock it since require might have issues with TS)
const testChannelGroupsDirectly = async () => {
  let connection;
  
  try {
    console.log('Testing Channel Groups Functionality Directly...');
    console.log('===============================================\n');
    
    // Create database connection
    connection = postgres(process.env.DATABASE_URL);
    
    console.log('✓ Database connection established');
    
    // Test 1: Check if channelgroup column exists
    console.log('\n1. Checking table structure...');
    const tableStructure = await connection`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'mentions_classify' 
      AND table_schema = 'public'
      AND column_name IN ('groupname', 'channel', 'channelgroup')
      ORDER BY ordinal_position;
    `;
    
    console.log('Table columns found:');
    tableStructure.forEach(col => {
      console.log(`- ${col.column_name} (${col.data_type})`);
    });
    
    const hasChannelGroup = tableStructure.some(col => col.column_name === 'channelgroup');
    console.log(`\n✓ channelgroup column exists: ${hasChannelGroup}`);
    
    // Test 2: Execute the exact query you requested
    console.log('\n2. Executing your requested query...');
    console.log('SQL: SELECT groupname, channel, channelgroup, count(*) FROM mentions_classify GROUP BY groupname, channel, channelgroup ORDER BY channelgroup;');
    
    const channelGroupData = await connection`
      SELECT groupname, channel, channelgroup, count(*)::int as count
      FROM mentions_classify 
      WHERE groupname IS NOT NULL
      GROUP BY groupname, channel, channelgroup 
      ORDER BY channelgroup NULLS LAST, count DESC
      LIMIT 20;
    `;
    
    console.log(`\n✓ Query executed successfully. Found ${channelGroupData.length} results.`);
    
    // Test 3: Show sample data
    console.log('\n3. Sample Channel Group Data:');
    console.log('=====================================');
    
    if (channelGroupData.length > 0) {
      console.log('Format: Group Name | Channel | Channel Group | Count');
      console.log('-----------------------------------------------------');
      
      channelGroupData.slice(0, 10).forEach((row, index) => {
        const groupname = (row.groupname || 'NULL').padEnd(20);
        const channel = (row.channel || 'NULL').padEnd(15);
        const channelgroup = (row.channelgroup || 'NULL').padEnd(15);
        const count = row.count.toString().padStart(6);
        
        console.log(`${index + 1}. ${groupname} | ${channel} | ${channelgroup} | ${count}`);
      });
      
      if (channelGroupData.length > 10) {
        console.log(`... and ${channelGroupData.length - 10} more records`);
      }
    } else {
      console.log('No data found in mentions_classify table.');
    }
    
    // Test 4: Focus on radio stations specifically
    console.log('\n4. Radio Stations Analysis:');
    console.log('============================');
    
    const radioData = await connection`
      SELECT groupname, channel, channelgroup, count(*)::int as count
      FROM mentions_classify 
      WHERE LOWER(groupname) LIKE '%radio%'
      GROUP BY groupname, channel, channelgroup 
      ORDER BY count DESC
      LIMIT 10;
    `;
    
    if (radioData.length > 0) {
      console.log(`Found ${radioData.length} radio station channel combinations:`);
      console.log('Format: Group Name | Channel | Channel Group | Count');
      console.log('-----------------------------------------------------');
      
      radioData.forEach((row, index) => {
        const groupname = (row.groupname || 'NULL').padEnd(25);
        const channel = (row.channel || 'NULL').padEnd(15);
        const channelgroup = (row.channelgroup || 'NULL').padEnd(15);
        const count = row.count.toString().padStart(6);
        
        console.log(`${index + 1}. ${groupname} | ${channel} | ${channelgroup} | ${count}`);
      });
    } else {
      console.log('No radio stations found in the data.');
    }
    
    // Test 5: Summary statistics
    console.log('\n5. Summary Statistics:');
    console.log('======================');
    
    const summary = await connection`
      SELECT 
        COUNT(*) as total_records,
        COUNT(DISTINCT groupname) as unique_groupnames,
        COUNT(DISTINCT channel) as unique_channels,
        COUNT(DISTINCT channelgroup) as unique_channelgroups,
        SUM(CASE WHEN channelgroup IS NULL THEN 1 ELSE 0 END) as null_channelgroups
      FROM mentions_classify 
      WHERE groupname IS NOT NULL;
    `;
    
    if (summary.length > 0) {
      const stats = summary[0];
      console.log(`- Total Records: ${stats.total_records}`);
      console.log(`- Unique Group Names: ${stats.unique_groupnames}`);
      console.log(`- Unique Channels: ${stats.unique_channels}`);
      console.log(`- Unique Channel Groups: ${stats.unique_channelgroups}`);
      console.log(`- Records with NULL channelgroup: ${stats.null_channelgroups}`);
    }
    
    console.log('\n✓ All tests completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed with error:');
    console.error('Error:', error.message);
    console.error('Details:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✓ Database connection closed');
    }
  }
};

// Run the test
testChannelGroupsDirectly();