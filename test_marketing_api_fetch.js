// Test marketing API directly by simulating the API call
async function testMarketingAPI() {
  try {
    console.log('Testing Marketing API endpoint...\n');
    
    const response = await fetch('http://localhost:3031/api/marketing-analysis');
    console.log('Response status:', response.status);
    console.log('Response OK:', response.ok);
    
    if (!response.ok) {
      const text = await response.text();
      console.log('Error response:', text);
      return;
    }
    
    const data = await response.json();
    console.log('\n✅ API Response:');
    console.log('Success:', data.success);
    console.log('Has data:', data?.data ? 'Yes' : 'No');
    
    if (data?.data) {
      console.log('\nSummary:');
      console.log('- Total Current:', data.data.summary?.totalCurrent);
      console.log('- Total Previous:', data.data.summary?.totalPrevious);
      console.log('- Overall Change:', data.data.summary?.overallChange);
      console.log('- Active Saluran:', data.data.summary?.activeSaluran);
      
      console.log('\nSaluran Metrics:', data.data.saluranMetrics?.length, 'records');
      if (data.data.saluranMetrics?.length > 0) {
        console.log('First saluran:', data.data.saluranMetrics[0]);
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testMarketingAPI();
