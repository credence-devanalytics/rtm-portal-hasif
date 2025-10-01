// Mock test showing how the fetch function works and expected channel output
// This simulates the exact structure and data flow of your channel groups functionality

console.log('='.repeat(60));
console.log('CHANNEL GROUPS FETCH FUNCTION TEST - MOCK SIMULATION');
console.log('='.repeat(60));
console.log();

// Mock data that represents what your database would return
const mockChannelGroupData = [
  // Radio Stations Examples
  { groupname: 'Radio Nasional', channel: 'NASIONALfm', channelgroup: 'FM Stations', count: 156 },
  { groupname: 'Radio Daerah', channel: 'JOHORfm', channelgroup: 'Regional FM', count: 89 },
  { groupname: 'Radio Daerah', channel: 'KEDAHfm', channelgroup: 'Regional FM', count: 67 },
  { groupname: 'Radio Musik', channel: 'TRAXXfm', channelgroup: 'Music Stations', count: 234 },
  { groupname: 'Radio Klasik', channel: 'RADIO KLASIK', channelgroup: 'Specialty Radio', count: 45 },
  { groupname: 'Radio Daerah', channel: 'SABAHfm', channelgroup: 'Regional FM', count: 78 },
  { groupname: 'Radio Daerah', channel: 'PERAKfm', channelgroup: 'Regional FM', count: 92 },
  { groupname: 'Radio Nasional', channel: 'MUTIARAfm', channelgroup: 'FM Stations', count: 112 },
  { groupname: 'Radio Daerah', channel: 'KELANTANfm', channelgroup: 'Regional FM', count: 54 },
  { groupname: 'Radio Nasional', channel: 'AI fm', channelgroup: 'FM Stations', count: 187 },
  
  // TV Channels Examples  
  { groupname: 'TV Perdana', channel: 'TV1', channelgroup: 'Main Channels', count: 445 },
  { groupname: 'TV Perdana', channel: 'TV2', channelgroup: 'Main Channels', count: 389 },
  { groupname: 'TV Sukan', channel: 'Sukan RTM', channelgroup: 'Sports Channels', count: 167 },
  { groupname: 'TV Hiburan', channel: 'TV6', channelgroup: 'Entertainment', count: 234 },
  { groupname: 'TV Digital', channel: 'TV Okey', channelgroup: 'Digital Channels', count: 123 },
  
  // News Channels
  { groupname: 'Berita RTM', channel: 'Berita RTM', channelgroup: 'News Channels', count: 678 },
  { groupname: 'Official RTM', channel: 'RTM Official', channelgroup: 'Official Channels', count: 345 },
];

// Simulate the API fetch function behavior
function mockFetchChannelGroups(filterType = 'all') {
  console.log(`🔍 Fetching channel groups with filter: "${filterType}"`);
  console.log(`📡 API Endpoint: /api/channel-groups?type=${filterType}`);
  console.log();
  
  // Filter data based on type (simulating the WHERE clause)
  let filteredData = mockChannelGroupData;
  
  switch (filterType) {
    case 'radio':
      filteredData = mockChannelGroupData.filter(item => 
        item.groupname.toLowerCase().includes('radio')
      );
      break;
    case 'tv':
      filteredData = mockChannelGroupData.filter(item => 
        item.groupname.toLowerCase().includes('tv')
      );
      break;
    case 'news':
      filteredData = mockChannelGroupData.filter(item => 
        item.groupname.toLowerCase().includes('berita') || 
        item.groupname.toLowerCase().includes('news')
      );
      break;
    case 'official':
      filteredData = mockChannelGroupData.filter(item => 
        item.groupname.toLowerCase().includes('official')
      );
      break;
  }
  
  // Sort by channelgroup then by count (simulating ORDER BY channelgroup)
  filteredData.sort((a, b) => {
    if (a.channelgroup !== b.channelgroup) {
      return a.channelgroup.localeCompare(b.channelgroup);
    }
    return b.count - a.count;
  });
  
  // Calculate summary statistics
  const summary = {
    totalRecords: filteredData.reduce((sum, item) => sum + item.count, 0),
    uniqueGroups: new Set(filteredData.map(item => item.groupname)).size,
    uniqueChannels: new Set(filteredData.map(item => item.channel)).size,
    uniqueChannelGroups: new Set(filteredData.map(item => item.channelgroup)).size
  };
  
  return {
    meta: {
      filterType,
      timestamp: new Date().toISOString(),
      summary
    },
    data: {
      sqlFormat: filteredData,
      byChannelGroup: groupByChannelGroup(filteredData)
    }
  };
}

// Helper function to group data by channel group
function groupByChannelGroup(data) {
  const grouped = {};
  
  data.forEach(item => {
    if (!grouped[item.channelgroup]) {
      grouped[item.channelgroup] = {
        channelGroup: item.channelgroup,
        totalMentions: 0,
        channels: []
      };
    }
    
    grouped[item.channelgroup].totalMentions += item.count;
    grouped[item.channelgroup].channels.push({
      groupname: item.groupname,
      channel: item.channel,
      count: item.count
    });
  });
  
  return Object.values(grouped).sort((a, b) => b.totalMentions - a.totalMentions);
}

// Test different filter types
const filterTypes = ['all', 'radio', 'tv', 'news'];

filterTypes.forEach((filterType, index) => {
  if (index > 0) console.log('\n' + '-'.repeat(50) + '\n');
  
  console.log(`TEST ${index + 1}: FILTER TYPE = "${filterType.toUpperCase()}"`);
  console.log('='.repeat(40));
  
  const result = mockFetchChannelGroups(filterType);
  
  // Show meta information
  console.log('📊 SUMMARY STATISTICS:');
  console.log(`   • Filter Applied: ${result.meta.filterType}`);
  console.log(`   • Total Records: ${result.meta.summary.totalRecords.toLocaleString()}`);
  console.log(`   • Unique Group Names: ${result.meta.summary.uniqueGroups}`);
  console.log(`   • Unique Channels: ${result.meta.summary.uniqueChannels}`);
  console.log(`   • Unique Channel Groups: ${result.meta.summary.uniqueChannelGroups}`);
  console.log();
  
  // Show SQL format data (your requested query format)
  console.log('📋 SQL FORMAT OUTPUT (your requested query):');
  console.log('   SELECT groupname, channel, channelgroup, count(*)');
  console.log('   FROM mentions_classify GROUP BY groupname, channel, channelgroup ORDER BY channelgroup');
  console.log();
  console.log('   ' + 'Group Name'.padEnd(15) + ' | ' + 'Channel'.padEnd(15) + ' | ' + 'Channel Group'.padEnd(18) + ' | Count');
  console.log('   ' + '-'.repeat(70));
  
  result.data.sqlFormat.forEach((row, i) => {
    const groupname = row.groupname.padEnd(15);
    const channel = row.channel.padEnd(15);
    const channelgroup = row.channelgroup.padEnd(18);
    const count = row.count.toString().padStart(5);
    
    console.log(`   ${groupname} | ${channel} | ${channelgroup} | ${count}`);
  });
  
  // Show grouped format
  if (result.data.byChannelGroup.length > 0) {
    console.log();
    console.log('📊 GROUPED BY CHANNEL GROUP:');
    result.data.byChannelGroup.forEach(group => {
      console.log(`   🏷️  ${group.channelGroup} (${group.totalMentions} total mentions)`);
      group.channels.forEach(channel => {
        console.log(`      • ${channel.channel} - ${channel.groupname} (${channel.count})`);
      });
    });
  }
});

// Show how this would be used in React components
console.log('\n' + '='.repeat(60));
console.log('REACT COMPONENT USAGE EXAMPLE');
console.log('='.repeat(60));

console.log(`
// In a React component:
import { useChannelGroupsData } from '@/hooks/useChannelGroupsData';

function RadioChannelAnalysis() {
  const { data, isLoading, error } = useChannelGroupsData('radio');
  
  if (isLoading) return <div>Loading channel groups...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <h2>Radio Stations Analysis</h2>
      <p>Total Records: {data.meta.summary.totalRecords}</p>
      <p>Unique Channel Groups: {data.meta.summary.uniqueChannelGroups}</p>
      
      {/* Display the SQL format data */}
      <table>
        <thead>
          <tr>
            <th>Group Name</th>
            <th>Channel</th>
            <th>Channel Group</th>
            <th>Count</th>
          </tr>
        </thead>
        <tbody>
          {data.data.sqlFormat.map((row, index) => (
            <tr key={index}>
              <td>{row.groupname}</td>
              <td>{row.channel}</td>
              <td>{row.channelgroup}</td>
              <td>{row.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
`);

console.log('\n' + '='.repeat(60));
console.log('✅ FETCH FUNCTION TEST COMPLETED');
console.log('This shows exactly how your channel groups data will be structured and displayed.');
console.log('Once the database is connected, the real data will follow this exact format.');
console.log('='.repeat(60));