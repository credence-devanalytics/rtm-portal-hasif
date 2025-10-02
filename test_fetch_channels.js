// Test script to fetch channel group data from the API
// This simulates what the React component would do

const fetch = require('node-fetch');

async function testChannelGroupsFetch() {
  try {
    console.log('Testing Channel Groups API...\n');
    
    // Test different filter types
    const filterTypes = ['all', 'radio', 'tv', 'news'];
    
    for (const filterType of filterTypes) {
      console.log(`\n=== Testing filter: ${filterType} ===`);
      
      try {
        const response = await fetch(`http://localhost:3002/api/channel-groups?type=${filterType}`);
        
        if (!response.ok) {
          console.error(`HTTP Error: ${response.status} - ${response.statusText}`);
          continue;
        }
        
        const data = await response.json();
        
        console.log('Meta Information:');
        console.log('- Filter Type:', data.meta?.filterType);
        console.log('- Total Records:', data.meta?.summary?.totalRecords);
        console.log('- Unique Groups:', data.meta?.summary?.uniqueGroups);
        console.log('- Unique Channels:', data.meta?.summary?.uniqueChannels);
        console.log('- Unique Channel Groups:', data.meta?.summary?.uniqueChannelGroups);
        
        console.log('\nFirst 5 Channel Group Records:');
        const sqlData = data.data?.sqlFormat || [];
        sqlData.slice(0, 5).forEach((record, index) => {
          console.log(`${index + 1}. Group Name: "${record.groupname}"`);
          console.log(`   Channel: "${record.channel}"`);
          console.log(`   Channel Group: "${record.channelgroup}"`);
          console.log(`   Count: ${record.count}`);
          console.log('');
        });
        
        if (sqlData.length > 5) {
          console.log(`... and ${sqlData.length - 5} more records\n`);
        }
        
      } catch (fetchError) {
        console.error(`Error fetching ${filterType} data:`, fetchError.message);
      }
    }
    
  } catch (error) {
    console.error('Test script error:', error);
  }
}

// Also test the mentions API to see channel group data
async function testMentionsAPIForChannelGroups() {
  try {
    console.log('\n\n=== Testing Mentions API (includes channel groups) ===');
    
    const response = await fetch('http://localhost:3002/api/mentions?limit=10');
    
    if (!response.ok) {
      console.error(`HTTP Error: ${response.status} - ${response.statusText}`);
      return;
    }
    
    const data = await response.json();
    
    console.log('Mentions API Response Structure:');
    console.log('- Total Mentions:', data.metrics?.totalMentions);
    console.log('- Total Reach:', data.metrics?.totalReach);
    console.log('- Channel Groups Available:', data.channelGroups ? 'Yes' : 'No');
    
    if (data.channelGroups && data.channelGroups.length > 0) {
      console.log('\nFirst 5 Channel Groups from Mentions API:');
      data.channelGroups.slice(0, 5).forEach((record, index) => {
        console.log(`${index + 1}. Group Name: "${record.groupname}"`);
        console.log(`   Channel: "${record.channel}"`);
        console.log(`   Channel Group: "${record.channelgroup}"`);
        console.log(`   Count: ${record.count}`);
        console.log(`   Total Reach: ${record.totalReach}`);
        console.log('');
      });
    }
    
    // Also show some raw mentions data to see if channelgroup is included
    if (data.mentions && data.mentions.length > 0) {
      console.log('\nSample Raw Mention Record (showing channel fields):');
      const sampleMention = data.mentions[0];
      console.log('- ID:', sampleMention.id || sampleMention.idpk);
      console.log('- Channel:', sampleMention.channel);
      console.log('- Channel Group:', sampleMention.channelgroup);
      console.log('- Group Name:', sampleMention.groupname);
      console.log('- Type/Platform:', sampleMention.type);
      console.log('- Author:', sampleMention.author);
      console.log('- Date:', sampleMention.inserttime);
    }
    
  } catch (error) {
    console.error('Error testing mentions API:', error.message);
  }
}

// Run the tests
async function runAllTests() {
  console.log('Channel Group Fetch Testing Started...');
  console.log('=====================================');
  
  // Wait a moment for server to be ready
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await testChannelGroupsFetch();
  await testMentionsAPIForChannelGroups();
  
  console.log('\n=====================================');
  console.log('Testing completed!');
}

runAllTests();