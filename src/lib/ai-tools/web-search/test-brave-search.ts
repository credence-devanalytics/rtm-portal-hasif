import { createBraveSearchClient, BraveSearchOptions } from './brave-search';

// Simple test function for Brave Search
export async function testBraveSearch() {
  console.log('Testing Brave Search API...');

  try {
    // This would only work in a server environment where BRAVE_API_KEY is available
    if (typeof window !== 'undefined') {
      console.log('Cannot test in browser environment - requires server-side API key');
      return;
    }

    const client = createBraveSearchClient();

    // Test basic search
    const testQuery = 'artificial intelligence trends';
    const options: BraveSearchOptions = {
      count: 5,
      freshness: 'pw',
      result_filter: 'web,news'
    };

    console.log(`Testing search for: "${testQuery}"`);
    const result = await client.search(testQuery, options);

    console.log('✅ Search successful!');
    console.log(`Found ${result.web?.results?.length || 0} web results`);
    console.log(`Found ${result.news?.results?.length || 0} news results`);

    if (result.web?.results?.[0]) {
      console.log('Sample result:', {
        title: result.web.results[0].title,
        url: result.web.results[0].url,
        age: result.web.results[0].age
      });
    }

    return result;

  } catch (error) {
    console.error('❌ Brave Search test failed:', error);
    throw error;
  }
}

// Export for potential server-side testing
export { testBraveSearch as default };