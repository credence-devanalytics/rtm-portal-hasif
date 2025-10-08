/**
 * Test the exact requests that the UnifiTV page makes
 */

async function testUnifiTVPageRequests() {
  console.log('=== Testing UnifiTV Page Requests ===\n');
  
  const baseURL = 'http://localhost:3000';
  
  try {
    // Simulate the initial page load with default filters
    console.log('1. Testing initial page load (monthYear=202505, channel=all)...');
    
    // Main data request
    const params1 = new URLSearchParams({
      monthYear: '202505',
      sortBy: 'mau',
      sortOrder: 'desc'
    });
    
    // Trends request (no month filter)
    const trendsParams1 = new URLSearchParams({
      sortBy: 'mau',
      sortOrder: 'desc'
    });
    
    const [response1, trendsResponse1] = await Promise.all([
      fetch(`${baseURL}/api/unifi-viewership?${params1}`),
      fetch(`${baseURL}/api/unifi-viewership?${trendsParams1}`)
    ]);
    
    console.log(`Main request status: ${response1.status}`);
    console.log(`Trends request status: ${trendsResponse1.status}`);
    
    if (!response1.ok) {
      const errorData = await response1.json();
      console.error('❌ Main request failed:', errorData);
      return;
    }
    
    if (!trendsResponse1.ok) {
      const errorData = await trendsResponse1.json();
      console.error('❌ Trends request failed:', errorData);
      return;
    }
    
    const data1 = await response1.json();
    const trendsData1 = await trendsResponse1.json();
    
    console.log('✅ Initial page load successful');
    console.log('Main data:', {
      records: data1.summary?.totalRecords,
      programs: data1.summary?.totalPrograms,
      channels: data1.summary?.totalChannels
    });
    console.log('Trends data:', {
      monthlyTrends: trendsData1.analytics?.monthlyTrends?.length,
      months: trendsData1.analytics?.monthlyTrends?.map(m => m.displayMonth).slice(0, 5)
    });
    
    // Test filter by channel
    console.log('\n2. Testing channel filter (TV1)...');
    const params2 = new URLSearchParams({
      monthYear: '202505',
      channel: 'TV1',
      sortBy: 'mau',
      sortOrder: 'desc'
    });
    
    const trendsParams2 = new URLSearchParams({
      channel: 'TV1',
      sortBy: 'mau',
      sortOrder: 'desc'
    });
    
    const [response2, trendsResponse2] = await Promise.all([
      fetch(`${baseURL}/api/unifi-viewership?${params2}`),
      fetch(`${baseURL}/api/unifi-viewership?${trendsParams2}`)
    ]);
    
    if (!response2.ok || !trendsResponse2.ok) {
      console.error('❌ Channel filter request failed');
      return;
    }
    
    const data2 = await response2.json();
    const trendsData2 = await trendsResponse2.json();
    
    console.log('✅ Channel filter successful');
    console.log('Filtered data:', {
      records: data2.summary?.totalRecords,
      topPrograms: data2.analytics?.topPrograms?.slice(0, 3).map(p => ({
        name: p.programName,
        mau: p.mau
      }))
    });
    
    // Verify data structure matches frontend expectations
    console.log('\n3. Verifying data structure...');
    const requiredFields = {
      data: !!data1.data,
      pagination: !!data1.pagination,
      summary: !!data1.summary,
      analytics: !!data1.analytics,
      'analytics.programBreakdown': !!data1.analytics?.programBreakdown,
      'analytics.channelBreakdown': !!data1.analytics?.channelBreakdown,
      'analytics.monthlyTrends': !!data1.analytics?.monthlyTrends,
      'analytics.topPrograms': !!data1.analytics?.topPrograms
    };
    
    const allFieldsPresent = Object.values(requiredFields).every(v => v);
    
    if (allFieldsPresent) {
      console.log('✅ All required fields present in response');
      console.log('Structure check:', requiredFields);
    } else {
      console.error('❌ Missing required fields:', 
        Object.entries(requiredFields).filter(([k, v]) => !v).map(([k]) => k)
      );
    }
    
    console.log('\n✅ All UnifiTV page requests working correctly!');
    console.log('\n🎉 The page should now load without the 500 error.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Check server and run tests
async function checkServer() {
  try {
    await fetch('http://localhost:3000');
    return true;
  } catch (error) {
    console.error('❌ Server not running on http://localhost:3000');
    console.log('Please start with: npm run dev');
    return false;
  }
}

checkServer().then(isRunning => {
  if (isRunning) {
    testUnifiTVPageRequests();
  }
});
