/**
 * Test the Unifi Viewership API endpoint
 */

async function testAPI() {
  console.log('=== Testing Unifi Viewership API ===\n');
  
  const baseURL = 'http://localhost:3000';
  
  try {
    // Test 1: Basic request with no filters
    console.log('1. Testing basic API request...');
    const response1 = await fetch(`${baseURL}/api/unifi-viewership`);
    console.log(`Status: ${response1.status} ${response1.statusText}`);
    
    if (!response1.ok) {
      const errorData = await response1.json();
      console.error('❌ API returned error:', errorData);
      return;
    }
    
    const data1 = await response1.json();
    console.log('✅ Basic request successful');
    console.log('Response summary:', {
      dataCount: data1.data?.length,
      totalRecords: data1.summary?.totalRecords,
      totalChannels: data1.summary?.totalChannels,
      totalPrograms: data1.summary?.totalPrograms
    });
    
    // Test 2: Request with month filter
    console.log('\n2. Testing with monthYear filter (202505)...');
    const response2 = await fetch(`${baseURL}/api/unifi-viewership?monthYear=202505`);
    console.log(`Status: ${response2.status} ${response2.statusText}`);
    
    if (!response2.ok) {
      const errorData = await response2.json();
      console.error('❌ API returned error:', errorData);
      return;
    }
    
    const data2 = await response2.json();
    console.log('✅ Filtered request successful');
    console.log('Response summary:', {
      dataCount: data2.data?.length,
      totalRecords: data2.summary?.totalRecords,
      hasAnalytics: !!data2.analytics,
      programBreakdownCount: data2.analytics?.programBreakdown?.length,
      channelBreakdownCount: data2.analytics?.channelBreakdown?.length,
      monthlyTrendsCount: data2.analytics?.monthlyTrends?.length
    });
    
    // Test 3: Request with channel filter
    console.log('\n3. Testing with channel filter (TV1)...');
    const response3 = await fetch(`${baseURL}/api/unifi-viewership?channel=TV1&monthYear=202505`);
    console.log(`Status: ${response3.status} ${response3.statusText}`);
    
    if (!response3.ok) {
      const errorData = await response3.json();
      console.error('❌ API returned error:', errorData);
      return;
    }
    
    const data3 = await response3.json();
    console.log('✅ Channel filtered request successful');
    console.log('Response summary:', {
      dataCount: data3.data?.length,
      totalRecords: data3.summary?.totalRecords,
      topPrograms: data3.analytics?.topPrograms?.slice(0, 3).map(p => p.programName)
    });
    
    console.log('\n✅ All API tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Check if we're running a Next.js server first
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3000');
    return true;
  } catch (error) {
    console.error('❌ Next.js server is not running on http://localhost:3000');
    console.log('Please start the server with: npm run dev');
    return false;
  }
}

checkServer().then(isRunning => {
  if (isRunning) {
    testAPI();
  }
});
